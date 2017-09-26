# JS-808 Practice exercise

The goal of this exercise is to practice designing models and
interfaces, and to get a feel for how you architect front-end code.

There aren't good or bad solutions, there are solutions that
match the requirements and some that don't. There are solutions that
might be considered elegant by some and solutions that would be
considered clever.

## Building a Drum Machine

This exercise assumes you are somewhat familiar with drum machines.
If you aren't
please read http://en.wikipedia.org/wiki/Drum_machine

Your challenge is to code the sequencer part of our Drum Machine which
we called JS-808. Your sequencer should be able to support the famous [four-on-the-floor](http://en.wikipedia.org/wiki/Four_on_the_floor_(music)) rhythm pattern, but be flexible enough to let a user edit the pattern to fit their musical whims.

![Example interface](/sequence-diagram.png?raw=true)

Note that instead of hearing an actual sound, you are expected to
generate a real time visual representation of the sequence being played.

### Expected Features

Your drum machine should include the following features:

* Basic transport controls (play, stop).
* The ability to alter the tempo of the sequence.
* Playback readout - there should be a visual indication of the current steps
while the sequence is playing. Ideally, the playback speed will also match the
sequence tempo.
* A list of at least 3 preset sequence patterns.


### Extra Info

* A song contains multiple patterns being sequenced for different
  samples.
* A song plays at a given tempo (AKA bpm), the tempo does not need to
  be able change while the song plays.
* The time signature is expected to be 4/4 (if you don't know what that
  is, don't worry and ignore this instruction).
* The pattern is expected to be 8 steps or more.

### Tools and Frameworks

Feel free to use whatever framework you want or no framework at all.

### Useful Timing Info

At a 4/4 time signature of 60 BPM (beats per minute), we get 1 beat per second.
We can assume that 8 steps = 1 bar, representing 4 beats.
In other words, a 8 step pattern would take `(60/BPM)*4` seconds to play and each step would take `((60/BPM)*4)/8` seconds.


### Extra mile

* Try mix and matching patterns of different durations (8, 16, 32 steps),
  note that if you have 2 patterns, one 8 and one 16, the 8 should play
  twice while the 16 plays once.
* Add support for velocity (the amplitude/volume of a note).
* Try to output sound - you might want to look at some higher-level libraries that allow you to load and play sounds rather than getting mired in the details of managing and playing the sounds directly (though you're certainly welcome to do that too).
* You don't have to limit yourself to the features/layout/parts on the diagram. Take inspiration from existing drum machines and feel free to get creative!

##### If you can't stop:

* How about live play? Can you allow users to add/remove/change patterns
  while playing?
* If you added sound playback, how about adding some visualizations? The Web Audio API provides some useful primitives for generating visual feedback.


### Splice Evaluation

If you are given this exercise as a code challenge, we are going to
discuss a few things with you. In order to help you prepare, here is a
list of various specific parts and general aspects of programming we are
interested in discussing:

* How much time did you spend on the exercise, what parts took longer?
* What were the hard parts, what parts did you enjoy most?
* Data modeling - How did you model the concepts of songs and
  tracks/patterns, can you explain why?
* Simplicity vs Flexibility - How flexible is your solution? Can a user
  define patterns of different lengths? Can they play at the same time?
  Can the patterns be changed in real time? Can the velocity be set?
  None of these features are expected, what is needed for you to add
  support for these?
* Is your code tested? Why/why not? How would you test it (or better)?


### Submitting your solution

As soon as you're ready, send us a link to your repo (either a fork of this repo or a new one that you created). You don't have to send us the link before you're ready, but we recommend committing code early and often, with clear descriptive commit messages. This helps us follow your thought process as you build your solution.

------------------

### Plan of Action

I've looked at the following JavaScript-based drum machines for inspiration:
* https://codepen.io/jamesmichael/pen/xVrBKR (not that extremely useful for this project)
* https://codepen.io/sebastianinman/pen/vLmNXZ (useful! pretty.)

The drum machine is a grid, and thus can be broken down as such: 

#### Main Machine Components
##### Cell (Step)
Each step is a cell that can be treated independently in terms of state.

Each cell has 3 states:
* active
* non-active (lacking of an active state)
* hit

A cell can only achieve the _hit_ state while it is _active_. An _active_ state is toggled by clicking on the cell.

##### Bar
A bar is a collection of cells with, given a 4/4 time signature and 1/8 note step length, 8 cells.

##### Row (Instrument)
A row consists of 1-4 bars. I could do more than 4 but that would be annoying to layout and still offer a usable experience. By default, a row will have 1 bar, but more can be added.

Each row has the following attributes in addition to its collection of cells:
* instrument name (selectable from pre-defined list).
* instrument sample (optional)
* amount of steps in row
* active/inactive state (optional - but when I program drums sometimes I like to temporarily take out the kick to hear what's happening a little clearer with everything else, so it's a ~nice~ to have if I have time.)

The exercise allows for the possibility of flexible step lengths for patterns. There are two ways that this could occur:
1. Bars always remain 8 steps long (8 8th notes), and thus a row would increase in size (visually) and the user would be able to add more bars in multiples of 8 (8, 16, 32).
2. The step-length of a bar can vary. For example, a user could set a bar to be 4 steps long (1/4 notes), 16 steps long (1/16 notes), or 32 steps long (1/32 notes). 

For the sake of simplicity, for now, option 1 seems like the way to go. Having variable length bars is...weird... on physical drum machines, and would be a more time-consuming problem to solve once dealing with playback. Also, given this "extra mile" requirement: "Try mix and matching patterns of different durations (8, 16, 32 steps), note that if you have 2 patterns, one 8 and one 16, the 8 should play twice while the 16 plays once.", that makes the most sense.

##### Grid (Machine Layout)
The drum machine grid will consist of numerous rows. So that I can start small, I am choosing to start with 1 row, and allow the user to add rows. Therefore, rows will be dynamically generated inside of the grid. This is why I've chosen to let the instrument name be selectable from a drop down menu for each row.

##### Play/Stop Button
A simple toggle UI element that starts the playback/stops the playback based on state.

##### Tempo Set
A number that will be displayed and adjustable to set the beats per minute.

##### Preset Select
A dropdown of preset rhythm patterns that the user can select from.

#### How Playback Works

Playback is dependent on tempo. As stated in the requirements, the tempo will determine how often a beat is played. 

_"At a 4/4 time signature of 60 BPM (beats per minute), we get 1 beat per second. We can assume that 8 steps = 1 bar, representing 4 beats. In other words, a 8 step pattern would take (60/BPM)*4 seconds to play and each step would take ((60/BPM)*4)/8 seconds."_

Simplifying for my own sake, given a 4/4 time signature and a tempo of 60BPM:
- 1 beat per second (ie. a quarter note every second).
- 2 steps per second (ie. two eigth notes every second).
- Each step takes 2/8ths of a second.

So, in pseudocode, calculating frequency of playback goes as follows:

( (bpm/60s) * numberOfBeats ) / stepsInBar

Since we're not varying the time signature nor the bar length, numberOfBeats will be kept constant at 4, and stepsInBar will be kept constant at 8. 

So, we can have a variable called playInterval like this, where bpm is the variable set by the tempo UI element:

((bpm/60s) * 4 ) / 8

I realize this is exactly how it's stated in the requirements, but I wanted to make sure I understood everything.

Assuming, at first, that all rows are the same length this is what should happen:
- User toggles the play button. bpm has a default value of 120 and is never blank, but the user can change it. If the user erases the bpm in the UI, it'll just be set to 120 upon playing.
- playInterval is calculated
- The first column in the grid is checked for active cells. If a cell is active, it's given the state of hit. 
- When the first interval is over, all states of "hit" are removed, and the next column is checked in the same way as the first. I could probably use a setTimeout, passing it the playInterval and a playNext function.
- When the last column is reached, it will go back to the first column.

If we want variable row lengths, however, playNext will need to handle not only looping through rows, but also be aware of bar length. So, if there's 2 bars, and we've reached the end of the first bar, it'll go to B2S1, rather than B1S1. This is why I've chosen to track bars as a collection within rows. 

#### Storing Presets
I'll use JSON to store the presets.

The following data is needed: 
- Tempo
- Rows
-- Instrument name
-- Instrument sample
-- Number of bars 
-- Active cells

I'll work out the formatting of the JSON when I get there and can test it.

#### Technology to be used.
Since this requires a lot of DOM manipulation, I'll be using jQuery. I'll also use SCSS to make writing the CSS simpler and easier to organize. 
