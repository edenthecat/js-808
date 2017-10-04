$(document).ready(function() {
  /*
  * DATA
  */
  var barLength = 8;
  var step = 0;
  var totalSteps = 0;
  var presetFile = "presets.json";
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
  * UI-BASED EVENT HANDLERS ----------------------------------------------------
  */

  // GRID
  $(".grid").ready(function() {
    presetList = getPresetList(presetFile);
    loadPreset("rock beat");
  });

  // ROWS
  // Add a row when user clicks "add new row"
  $("#addNewRow").click(function() {
    stopMachine();
    addNewRow();
  });

  // BPM
  // When bpm is changed, stop the machine
  // TODO: Refactor so that user doesn't have to press
  // play again
  $("#bpm").change(function() {
    stopMachine();
  });

  // PRESETS
  // When presets change, clear machine and load new preset
  $("#presets").change(function() {
    clearMachine();
    preset = $("select option:selected").text();
    loadPreset(preset);
  });

  // PLAY/PAUSE/STOP
  $(".play-button").click(function() {
    var $this = $(this);

    $this.toggleClass("playing");
    $this.toggleClass("fa-play");
    $this.toggleClass("fa-pause");

    $(".grid").toggleClass("playing");
    if($this.hasClass("playing")) {
      $(".grid").trigger("machine:playing");
    } else {
      $(".grid").trigger("machine:paused");
    }
  });

  $(".stop-button").click(function() {
    stopMachine();
  });

  /*
  * OTHER EVENT HANDLERS
  */
  $(".grid").on("machine:playing", function() {
    $this = $(this);

    playFrequency = getPlayFrequency();

    initializeGrid($this);

    playId = setInterval(play, playFrequency);
    $this.attr("data-play-id", playId);
  });

  $(".grid").on("machine:paused", function() {
    $this = $(this);

    playId = $this.data("play-id");
    $this.removeData("play-id");
    $this.removeAttr("data-play-id");
    clearInterval(playId);
  });

  /*
  *
  * FUNCTIONS ------------------------------------------------------------------
  *
  */


  // PLAY/PAUSE/STOP
  function play() {
    $rows = getAllRowsInGrid();
    $rows.trigger("row:play");
    incrementStep();
  }

  function stopMachine() {
    $(".grid").trigger("machine:paused");
    $(".play-button").trigger("click");
    $(".current").removeClass("current");
  }

  function playRow($row) {
    var $currentCell = getCurrentCell($row);
    var $currentBar = getBarFromCell($currentCell);

    var $nextCell = getNextCell($row, $currentBar, $currentCell);
    var $nextBar = getBarFromCell($nextCell);

    setCurrentBar($row, $nextBar);

    setCurrentCell($row, $nextCell);
  }

  function getPlayFrequency() {
    bpm = $("#bpm").val();
    beatsPerBar = 4;

    // See http://xmidi.com/bpm.pdf for formula
    playFrequency = 1000 / ( bpm / 60 ) * (beatsPerBar / barLength);
    return playFrequency;
  }

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
  * UI GENERATION/DESTRUCTION FUNCTIONS ----------------------------------------
  */

  // GRID
  function initializeGrid($grid) {
    $rows = $grid.children();

    for(var i = 0; i < $rows.length; i++) {
      $row = $($rows[i]);

      $firstBar = getFirstBarInRow($row);
      setCurrentBar($row, $firstBar);

      $firstCell = $($firstBar.get(0));
      setCurrentCell($row, $firstCell);
    }
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

  function clearMachine() {
    $(".grid").empty();
  }

  // ROW
  function generateRow(instrumentName = "kick") {
    var rowIndex = 0;
    if ($(".row").length > 0) {
      rowIndex = $(".row").last().data("row") + 1;
    }
    $row = $("<div>", {"class": "row", "data-row": rowIndex});

    $controls = $("<div>", {"class": "controls"});

    $instrumentSelect = generateInstrumentSelect();
    if (instrumentName) {
     $instrumentSelect.val(instrumentName);
    }
    $instrumentSelect.appendTo($controls);

    $addNewBarButton = $("<div/>", {"class": "add-new-bar"})
      .text("Add New Bar");
    $addNewBarButton.on("click", function(e) {
      addNewBar(e);
    });
    $addNewBarButton.appendTo($controls);

    $controls.appendTo($row);

    $row.on("row:play", function() {
       $this = $(this);
       if(step == 0 && totalSteps == 0) {
        var $currentCell = getCellByIndices($this.data("row"), 0, step);
        $currentCell.addClass("current");
        var $currentBar = $($this.children().get(0));
        $currentBar.addClass("current");
       }
       playRow($this);
    });
    return $row;
  }

  function addNewRow() {
    rowIndex = $(".row").last().data("row") + 1;

    var $row = generateRow("kick");
    var $bar = generateBar(0);
    $bar.appendTo($row);

    $row.appendTo($(".grid"));
  }

  // BAR
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

  function addNewBar(e) {
    $currentRow = $(e.currentTarget).parent().parent();
    $lastBar = getLastBarInRow($currentRow);
    barIndex = $lastBar.data("bar") + 1;
    $bar = generateBar(barIndex);
    $bar.appendTo($currentRow);
  }

  // INSTRUMENT SELECT
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

  // PRESETS

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

  /*
  * SETTERS/GETTERS ------------------------------------------------------------
  */

  // ROWS

  function getAllRowsInGrid() {
    return $(".grid").children(".row");
  }


  // BARS
  function setCurrentBar($row, $bar) {
    if(!$bar.hasClass("current")) {
      $bars = getAllBarsInRow($row);
      $bars.removeClass("current");
      $bar.addClass("current");
    }
  }

  function getCurrentBar($row) {
    $bar = $($row.children(".current"));
    if($bar.length == 0) {
      $bar = getFirstBarInRow($row);
      setCurrentBar($row, $bar);
    }
    return $bar;
  }

  function getBarFromCell(cell) {
    return $(cell).parent(".bar");
  }

  function getAllBarsInRow($row) {
    return $row.children(".bar");
  }

  function getLastBarInRow($row) {
    return getAllBarsInRow($row).last();
  }

  function getFirstBarInRow($row) {
    return getAllBarsInRow($row).first();
  }


  // CELLS
  function setCurrentCell(row, cell) {
    $bars = getCurrentBar(row);
    $bars.children().removeClass("current");
    cell.addClass("current");
  }

  function getCurrentCell(row) {
    var rowIndex = row.data("row");
    var barIndex = 0;
    var currentBar = getCurrentBar(row);
    if (currentBar.length > 0) {
      barIndex = currentBar.data("bar");
    }
    return getCellByIndices(rowIndex, barIndex, step);
  }

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

  function getCellByIndices(rowIndex, barIndex, cellIndex) {
    var row = $(".grid").children(".row").get(rowIndex);
    var bar = $(row).children(".bar").get(barIndex);
    var cell = $(bar).children(".cell").get(cellIndex);

    return $(cell);
  }

  // PRESETS
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

});
