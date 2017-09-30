$(document).ready(function(){
  /*
  * TESTING DATA
  */
  var bpm = 60;
  var barLength = 8;
  var step = 0;

  /*
  * UI INTERACTION & EVENT LISTENERS
  */

  /*
  * When a user clicks on a cell, that cell is set to active.
  */
  $(".cell").click(function() {
    $(this).toggleClass("active");
  });

  /*
  * When a user clicks on the play button:
  * - If not playing, it should play.
  * - If playing, it should pause.
  */
  $(".play-button").click(function() {
    var $this = $(this);
    var grid = $(".grid");

    $this.toggleClass("playing");
    if($this.hasClass("playing")) {
      grid.trigger("machine:playing");
    } else {
      grid.trigger("machine:paused");
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

  $(".row").on("row:play", function() {
    console.log("row playing");
    $this = $(this);
    console.log($this);

    playRow($this);
  });

  /*
  * FUNCTIONALITY
  */

  /*
  * play: play all active rows
  */
  function play() {
    rows = $(".grid").children(".row");
    console.log("is playing");
    rows.trigger("row:play");
    incrementStep();
  }
  /*
  * playRow: plays a row
  */
  function playRow(row) {
    var currentCell = getCurrentCell(row);
    console.log(row.data("row"));
    var currentBar = $(currentCell).parent();

    var nextCell = getNextCell(row, currentBar, currentCell);
    var nextBar = nextCell.parent();
    setCurrentBar(row, nextBar);

    setCurrentCell(row, nextCell);
    return true;
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
    if(step < 7) {
      step++;
    } else {
      step = 0;
    }
  }

  /*
  * Set current cell
  */
  function setCurrentCell(row, cell) {
    row.children().children().removeClass("current");
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
    console.log(bar);
    bar.siblings().removeClass("current");
    bar.addClass("current");
  }

  function getCurrentBar(row) {
    return $(row.children(".current"));
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
});
