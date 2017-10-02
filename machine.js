$(document).ready(function(){
  /*
  * TESTING DATA
  */
  var bpm = 60;
  var barLength = 8;
  var step = 0;
  var totalSteps = 0;
  var presetFile = "presets.json";
  var instrumentFile = "instruments.json";
  var instrumentList = [
    "kick",
    "snare",
    "rim click",
    "tom 1",
    "tom 2",
    "floor tom",
    "hi-hat",
    "open hi-hat",
    "ride",
    "ride bell",
    "hi-hat foot"];

  /*
  * INITIALIZATION
  */
  $(".grid").ready(function() {
    presetList = getPresetList(presetFile);
    loadPreset("rock beat");
  });

  function generateInstrumentSelect() {
    var $instrumentSelect = $("<select/>", {"class": "instrument-select"});
    for (var i=0; i < instrumentList.length; i++) {
      $option = $("<option/>")
        .val(instrumentList[i])
        .html(instrumentList[i])
        .appendTo($instrumentSelect);
    }
    return $instrumentSelect;
  }

  function getPresetList() {
    $.getJSON(presetFile, function( data ) {
      var presets = data.presets;
      var presetNames = Object.keys(presets);
      for (var i=0; i < presetNames.length; i++){
        $('<option/>')
          .val(presetNames[i])
          .html(presetNames[i])
          .appendTo('#presets');
      }
    });
  }

  function loadPreset(presetName) {
    $.getJSON(presetFile, function( data ) {
      var presets = Object.entries(data.presets);
      var preset = presets.find( function(item) {
        return item[0] == presetName;
      });
      displayPreset(preset[1]);
    });
  }

  function displayPreset(preset) {
    var instruments = preset.instruments;

    clearMachine();
    generateGridFromPreset(instruments);
  }

  function clearMachine() {
    $(".grid").empty();
  }

  function generateGridFromPreset(instruments) {
    for (var instrumentName in instruments) {
      var $row = generateRow(instrumentName);

      var bars = instruments[instrumentName];
      for (var i=0; i < bars.length; i++) {
        $bar = generateBar(i);
        for(var j=0; j < bars[i].length; j++) {
          if(bars[i][j] == 1) {
            var $cell = $($bar.children()[j]);
            $cell.addClass("active");
          }
        }
        $bar.appendTo($row);
      }
      $row.appendTo($(".grid"));
    }
  }

  function generateRow(instrumentName) {
    var rowIndex = 0;
    if ($(".row").length > 0) {
      rowIndex = $(".row").last().data("row") + 1;
    }
    $row = $("<div>", {"class": "row", "data-row": rowIndex});
    $instrumentSelect = generateInstrumentSelect();
    //if (instrumentName) {
    //  $instrumentSelect.val(instrumentName);
    //}
    //$instrumentSelect.appendTo($row);

    $row.on("row:play", function() {
       $this = $(this);
       playRow($this);
    });
    return $row;
  }

  /*
  * UI INTERACTION & EVENT LISTENERS
  */

  /*
  * When a user clicks on a cell, that cell is set to active.
  */


  /*
  * When a user clicks on the play button:
  * - If not playing, it should play.
  * - If playing, it should pause.
  */
  $(".play-button").click(function() {
    var $this = $(this);

    $this.toggleClass("playing");
    if($this.hasClass("playing")) {
      $(".grid").trigger("machine:playing");
    } else {
      $(".grid").trigger("machine:paused");
    }
  });

  /*
  * Event: Row Playing
  */
  $(".grid").on("machine:playing", function() {
    $this = $(this);

    playFrequency = getPlayFrequency();

    playId = setInterval(play, playFrequency);
    $this.attr("data-play-id", playId);
  });

  /*
  * Event: Row Paused
  */
  $(".grid").on("machine:paused", function() {
    $this = $(this);

    playId = $this.data("play-id");
    $this.removeData("play-id");
    $this.removeAttr("data-play-id");
    clearInterval(playId);
  });

  /*
  * FUNCTIONALITY
  */

  /*
  * play: play all active rows
  */
  function play() {
    rows = $(".grid").children(".row");
    rows.trigger("row:play");
    incrementStep();
  }
  /*
  * playRow: plays a row
  */
  function playRow(row) {
    console.log("playing row: " + step);
    if(step == 0 && totalSteps == 0) {
      var currentCell = getCellByIndices(row.data("row"), 0, step);
      currentCell.addClass("current");
    } else {
      var currentCell = getCurrentCell(row);
    }
    var currentBar = $(currentCell).parent();


    var nextCell = getNextCell(row, currentBar, currentCell);
    var nextBar = nextCell.parent();

    setCurrentBar(row, nextBar);

    setCurrentCell(row, nextCell);
    //return true;
  }

  /*
  * getPlayFrequency: calculates the play frequency based on the BPM
  */
  function getPlayFrequency() {
    playFrequency = ((bpm/60) * 4 ) / barLength; //calculate playFrequency in seconds
    playFrequency *= 1000; //convert to miliseconds
    return playFrequency;
  }


  /*
  * Set current step
  */
  function incrementStep() {
    console.log("incrementing step");
    if(step < 7) {
      step++;
    } else {
      step = 0;
    }
    totalSteps++;
  }

  /*
  * Set current cell
  */
  function setCurrentCell(row, cell) {
    $bars = getCurrentBar(row);
    $bars.children().removeClass("current");
    cell.addClass("current");
  }

  /*
  * Get current cell
  */
  function getCurrentCell(row) {
    var rowIndex = row.data("row");
    var barIndex = 0;
    var currentBar = getCurrentBar(row);
    if (currentBar.length > 0) {
      barIndex = currentBar.data("bar");
    }
    return getCellByIndices(rowIndex, barIndex, step);
  }

  function setCurrentBar(row, bar) {
    if(!bar.hasClass("current")) {
      $bars = $(row.children());
      $bars.removeClass("current");
      bar.addClass("current");
    }
  }

  function getCurrentBar(row) {
    $bar = $(row.children(".current"));
    if($bar.length == 0) {
      $bar = $(row.children().get(0));
      setCurrentBar(row, $bar);
    }
    return $bar;
  }

  /*
  * getNextCell: retrieves the next cell in a row
  */
  function getNextCell(row, bar, cell) {
    var numberOfBarsInRow = row.children().length;

    var rowIndex = row.data("row");
    var barIndex = bar.data("bar");
    var cellIndex = cell.data("cell");

    if( cellIndex < (barLength - 1)) {
      cellIndex++;
    } else if (cellIndex == (barLength - 1)) {
      cellIndex = 0;
      if (barIndex < (numberOfBarsInRow - 1)) {
        barIndex++;
      } else if (barIndex == (numberOfBarsInRow - 1)) {
        barIndex = 0;
      }
    }

    return getCellByIndices(rowIndex, barIndex, cellIndex);
  }

  /*
  * getCellByIndices: given a set of indices, returns the specified cell (jQuery object)
  */
  function getCellByIndices(rowIndex, barIndex, cellIndex) {
    var row = $(".grid").children(".row").get(rowIndex);
    var bar = $(row).children(".bar").get(barIndex);
    var cell = $(bar).children(".cell").get(cellIndex);

    return $(cell);
  }

  function addNewRow() {
    rowIndex = $(".row").last().data("row") + 1;

    var $row = $("<div>", {"class": "row", "data-row": rowIndex});

    var $bar = generateBar(0);
    $bar.appendTo($row);

    $row.appendTo($(".grid"));
  }

  function generateBar(barIndex) {
    var $bar = $("<div>", {"class": "bar", "data-bar": barIndex});

    for (i = 0; i < barLength; i++) {
      var $cell = $("<div>", {"class": "cell", "data-cell": i});

      $cell.click(function() {
          $(this).toggleClass("active");
      });

      $cell.appendTo($bar);
    }

    return $bar;
  }

});
