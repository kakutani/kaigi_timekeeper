/*
 timersrvを起動しないと音が鳴らないよ

 theTimer: メインの処理をやってる。UIとモデルの橋渡し? Controller??
 TalkTimer: カウントダウンが仕事
 NullTimer: TimerのNullオブジェクト

 TODO:
   - 休憩時間や、入れ替え時間の取り扱い
   - theTimerの状態管理をStateオブジェクトにしてObserverしたほうがよさそう
     - #confにステータスを出したい
   - soundapiのライセンスを調べないと(ウノウラボのやつ)
     - http://labs.unoh.net/2006/11/javascriptmp3.html
   - 起動/停止のRakeタスク化
   - githubに?
   - テスト
*/
var timerStatus = {"stop":0, "runNormal":1, "runWarn":2, "timeOver":3};
var timerStatusLabel = ["停止","作動中", "警告", "時間切れ"];

var ditital_bgcolor = "#7B8C5A"
var _miho_count = 0; // FIXME 音声再生時にsetTimeOutから見えるようにするため

var theTimer = {
   target: null,
   currentTimer: new NullTimer(),
   intervalTimer: null,

   initTalkTimer: function() {
      var talk = $("#conf_form > input[@name=talk]").val();
      var warningOn = $("#conf_form > input[@name=warning_on]").val();
	  var mihos = $("#conf_form > input[@name=miho][@type=checkbox]:checked");
	  mihos = mihos.map(function() { return $(this).val()});
	  var config = {"talk":talk, "warningOn":warningOn, "mihos":mihos}
	  this.currentTimer = new TalkTimer(config);
	  this.handleBgcolor();
   },

   startCountDown: function() {
	  this.stopCountDown();

	  this.initTalkTimer();
	  this.currentTimer.start();

	  this.intervalTimer = window.setInterval("theTimer.tickTack()", 150);
   },

  stopCountDown: function() {
     window.clearInterval(this.intervalTimer);
	 this.currentTimer.status = timerStatus.stop;
  },

   currentStatus: function() {
	  return this.currentTimer.status;
   },

   registerElement: function(e) {
	  this.target = e;
   },

   handleBgcolor: function() {
      $("body").css("background-color", this.currentTimer.bgcolor());
   },

   formatRemainSecOf: function(sec) {
      var rs = Math.abs(sec)
      min = "%02d".sprintf(rs / 60)
      sec = "%02d".sprintf(rs % 60)
      return (min + ":" + sec)
   },


   tickTack: function() {
	  this.currentTimer.tickTack();
	  this.refreshText();
   },

   reload: function() {
	  this.initTalkTimer();
	  this.refreshText();
	  this.currentTimer.status = timerStatus.stop;
   },

   refreshText: function() {
	  this.handleBgcolor();
	  this.target.text(this.formatRemainSecOf(this.currentTimer.remainSec));
   },


   startOrStop: function () {
	  switch(this.currentStatus()) {
	  case timerStatus.stop:
		 this.startCountDown();
		 break;
	  case timerStatus.intermission:
		 this.startCountDown();
		 break;
	  default:
		 this.stopCountDown();
		 break;
	  }
   }
};

function TalkTimer(config) {
   this.allotted = config.talk // 持ち時間
   this.warningOn = config.warningOn
   this.mihos = config.mihos
   this.mihos_done = []
   for (i = 0;i < this.mihos.length;i++) {
	  this.mihos_done[i] = false;
   }
   this.status = timerStatus.runNormal

   this.endAt = this.calcEndAt();
   this.remainSec = this.calcRemainSec();
}

TalkTimer.prototype = {
  bgcolor: function() {
     if (this.remainSec == null) return;
     switch(this.status) {
     case timerStatus.timeOver:
		return "red"
     case timerStatus.runWarn:
		return "yellow"
     case timerStatus.runNormal:
		return ditital_bgcolor
     default:
		return "pink" // must not happen
     }
  },
   start: function() {
      this.endAt = this.calcEndAt();
   },

   stop: function() {
	  this.status = timerStatus.stop;
   },

   calcRemainSec: function() {
      var now = new Date().getTime();
	  return Math.ceil((this.endAt - now) / 1000);
   },

   calcEndAt: function() {
	  return new Date().getTime() + this.allotted * 1000;
   },

   tickTack: function() {
      this.remainSec = this.calcRemainSec();
      if (this.remainSec <= 0) {
		 this.status = timerStatus.timeOver
      } else if (this.remainSec <= this.warningOn) {
		 this.status = timerStatus.runWarn
      } else {
		 this.status = timerStatus.runNormal
      }
	  for (i = 0; i < this.mihos.length;i++) {
		 if (this.mihos_done[i] == false && (this.mihos[i] * 60 + 1) == this.remainSec) {
			if (this.mihos_done[i] == false) {
			   _miho_count = this.mihos[i];
			   window.setTimeout("soundapi.playFile('sounds/miho-' + _miho_count + 'minutes.mp3')", 800);
			}
			this.mihos_done[i] = true;
		 }
	  }
   },
};

function NullTimer() {
   this.status = timerStatus.stop
}

NullTimer.prototype = {
   bgcolor: function() { return "gray" },
   start: function() {},
   tickTack: function() {}
};


function initializeTimerFontSize() {
  var d_w = $(document).width()
  var d_h = $(document).height()

  $("#timer").css("display","inline").css("font-size", 8)

  var t_w = $("#timer").width()
  var t_h = $("#timer").height()

   var fontSize = Math.min((d_w / t_w) * 8  , (d_h / t_h) * 8);

   var resized_w = $("#timer").width();
   var resized_h = $("#timer").height();
   var top_margin = (d_h - resized_h) / 4;
   $("#timer").css("display", "block").css("font-size", Math.floor(fontSize) - 10).css("top", top_margin).show();
}

var presetValues = {
   "lightning":{
	  "talk": 300,
	  "warning_on": 30,
	  "mihos": [1, 2],
   },
   "10min":{
	  "talk": 600,
	  "warning_on": 60,
	  "mihos": [1, 3],
   },
   "15min":{
	  "talk": 900,
	  "warning_on": 60,
	  "mihos": [1, 2, 5],
   },
   "30min":{
	  "talk": 1800,
	  "warning_on": 120,
	  "mihos": [1, 3, 5],
   },
   "test":{
	  "talk": 62,
	  "warning_on": 56,
	  "mihos": [1],
   },

}

function initializeDefaultValues() {
   var initial = $("#conf_form > input#mode_lightning");
   initial.attr("checked", "checked");
   handlePresetValues(initial);
}

function handlePresetValues(radio) {
   var talk = $("#conf_form > input[name='talk']");
   var warning_on = $("#conf_form > input[name='warning_on']");
   var mihos = $("#conf_form :checkbox");
   var config = presetValues[$(radio).val()];
   talk.attr("value", config.talk);
   warning_on.attr("value", config.warning_on);
   mihos.each(function() {$(this).attr("checked", "")});
   for (i =0;i< config.mihos.length;i++) {
	  $(mihos[config.mihos[i] - 1]).attr("checked", "checked");
   }
   theTimer.reload();
}

$(document).ready(
  function() {
	 theTimer.registerElement($("#timer"));
     initializeDefaultValues()
     initializeTimerFontSize()
	 $("#conf :radio").click(function() {handlePresetValues(this)})
     $(window).resize(function() { initializeTimerFontSize() })

	 $.hotkeys.add('c', function() { $("#conf").slideToggle()});
	 $.hotkeys.add('space', {'disableInInput': true}, function() { theTimer.startOrStop() });
	 $.hotkeys.add('r',  {'disableInInput': true}, function() { theTimer.reload(); });
	 $.hotkeys.add('left',  {'disableInInput': true}, function() { theTimer.reload(); });
  }
);
