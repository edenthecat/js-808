$(document).ready(function(){
  /*
  * TESTING DATA
  */
  var bpm = 60;
  var barLength = 8;

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
    var rows = $(".row");

    $this.toggleClass("playing");
    if($this.hasClass("playing")) {
      rows.trigger("row:playing");
    } else {
      rows.trigger("row:paused");
    }
  });

  /*
  * Event: Row Playing
  */
  $(".row").on("row:playing", function() {
    $this = $(this);

    playFrequency = getPlayFrequency();

    playId = setInterval(function() {playRow($this)}, playFrequency);
    $this.attr("data-play-id", playId);
  });

  /*
  * Event: Row Paused
  */
  $(".row").on("row:paused", function() {
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
  * playRow: plays a row
  */
  function playRow(row) {
    var currentCell = getCurrentCell(row);
    var currentBar = $(currentCell).parent(".bar");

    playCell(currentCell);

    var nextCell = getNextCell(row, currentBar, currentCell);

    setCurrentCell(row, nextCell);
    currentCell.removeClass("hit");
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
    var bars = $(row.children());
    var cells = $(bars.children());

    if(bars.children().hasClass("current")) {
      return $(bars.children(".current"));
    } else {
      currentCell = $(bars.children().get(0));
      setCurrentCell(row, currentCell);
      return $(currentCell);
    }
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

  /*
  * playCell: checks if a cell is active, and if it is, sets the state to hit.
  */
  function playCell(cell) {
    if (cell.hasClass("active")) {
      $(cell).addClass("hit");
    }
  }
});
