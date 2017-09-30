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
  * When a user clicks on a cell, it should activate that cell.
  */

  /*
  * When a user clicks on the play button:
  * - If not playing, it should play.
  * - If playing, it should pause.
  */

  /*
  * Event: Row Playing
  */

  /*
  * Event: Row Paused
  */

  /*
  * FUNCTIONALITY
  */

  /*
  * playRow: plays a row
  */

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

  /*
  * Get current cell
  */

  /*
  * getCellByIndices: given a set of indices, returns the specified cell (jQuery object)
  */

  /*
  * getNextCell: retrieves the next cell in a row
  */

  /*
  * playCell: checks if a cell is active, and if it is, sets the state to hit.
  */
});
