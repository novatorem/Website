$(document).ready(function(){

	//TIME
	function startTime() {
		var today=new Date();
		var h=today.getHours();
		var m=today.getMinutes();
		var days = ['Sun','Mon','Tues','Wednes','Thurs','Fri','Satur'];
		var months = ['Jan','Feb','Mar','Apr','May','Jun','July','Aug','Sep','Nov','Dec'];

		m = checkTime(m);
		h = checkTime(h);

		m = today.getHours()>12? m+' PM' : m+' AM';
		h = h>12? parseInt(h)-12: h ;

		$('#time').html(h+'<span>:</span>'+m);
		$('#day').html(days[today.getDay()]+'day');
		$('#date').html(months[today.getMonth()]+' '+today.getDate()+', '+today.getFullYear());

		setTimeout(function(){startTime()},500);
	}

	function checkTime(i) {
		i=i<10? i='0'+i:i;
		return i;
	}

	$('#time').html(startTime());
});
