var jQT = $.jQTouch({
	icon: 'kilo.png'
});

var db;

$(document).ready(function(){
	$('#createEntry form').submit(createEntry);
	$('#settings form').submit(saveSettings);
	$('#settings').bind('pageAnimationStart', loadSettings);
	$('#tasks li a').bind('click touchend', function(){
		var dayOffset = this.id;
		var date = new Date();
		date.setDate(date.getDate() - dayOffset);
		sessionStorage.currentDate = date.getMonth() + 1 + '/' + 
			date.getDate() + '/' + 
			date.getFullYear();
		refreshEntries();
	});
	
	var shortName = 'SB';
	var version = '1.0';
	var displayName = 'StudyBuddy';
	var maxSize = 65536;
	db = openDatabase(shortName, version, displayName, maxSize);
	db.transaction(
		function(transaction) {
			transaction.executeSql(
				'CREATE TABLE IF NOT EXISTS entries ' +
				' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
				' date DATE NOT NULL, cls TEXT NOT NULL, period INTEGER NOT NULL, asg TEXT NOT NULL,' +
				' hours INTEGER NOT NULL );'
			);
		}
	);
});

function saveSettings() {
	localStorage.age = $('#age').val();
	localStorage.budget = $('#budget').val();
	localStorage.weight = $('#weight').val();
	jQT.goBack();
	return false;
}

function loadSettings() {
	if (!localStorage.age) {
		localStorage.age = "";
	}
	if (!localStorage.budget) {
		localStorage.budget = "";
	}
	if (!localStorage.weight) {
		localStorage.weight = "";
	}
	$('#age').val(localStorage.age);
	$('#budget').val(localStorage.budget);
	$('#weight').val(localStorage.weight);
}

function refreshEntries() {
	var currentDate = sessionStorage.currentDate;
	$('#date h1').text(currentDate);
	$('#date ul li:gt(0)').remove();
	db.transaction(
		function(transaction) {
			transaction.executeSql(
				'SELECT * FROM entries WHERE date = ? ORDER BY cls;',
				[currentDate], 
				function (transaction, result) {
					for (var i=0; i < result.rows.length; i++) {
						var row = result.rows.item(i);
						var newEntryRow = $('#entryTemplate').clone();
						newEntryRow.removeAttr('id');
						newEntryRow.removeAttr('style');
						newEntryRow.data('entryId', row.id);
						newEntryRow.appendTo('#date ul');
						newEntryRow.find('.label').text("Class: " + row.cls);
						newEntryRow.find('.per').text("Period: " + row.period);
						newEntryRow.find('.asg').text("Assignment: " + row.asg);
						newEntryRow.find('.hours').text("Hours: " + row.hours);
						newEntryRow.find('.delete').click(function(){
							var clickedEntry = $(this).parent();
							var clickedEntryId = clickedEntry.data('entryId');
							deleteEntryById(clickedEntryId);
							clickedEntry.slideUp();
						});
						}
					}, 
				errorHandler
			);
		}
	);
}

function createEntry() {
	var date = sessionStorage.currentDate;
	var hours = $('#hours').val();
	var cls = $('#class').val();
	var per = $('#per').val();
	var asg = $('#asg').val();
	db.transaction(
		function(transaction) {
			transaction.executeSql(
				'INSERT INTO entries (date, hours, cls, period, asg) VALUES (?, ?, ?, ?, ?);', 
				[date, hours, cls, per, asg], 
				function(){
				refreshEntries();
				jQT.goBack();
				errorHandler
			});
		}
	);
	return false;
}

function errorHandler(transaction, error) {
	alert('Oops. Error was '+error.message+' (Code '+error.code+')');
	return true;
}

function deleteEntryById(id) {
	db.transaction(
		function(transaction) {
			transaction.executeSql('DELETE FROM entries WHERE id=?;', 
			[id], null, errorHandler);
		}
	);
}
