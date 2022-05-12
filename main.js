// Disk Class
class Disk {
    constructor (diskNum, row, col) {
      this.color = null
      this.diskNum = diskNum
      this.row = this.convertRow(row)
      this.col = this.convertCol(col)
      this.width = null
      this.sizeInc = 5.666666
  
      this.calculateWidth()
      this.determineColor()
    }
  
    calculatePosition () {
      return `${this.row} / ${this.col} / span 1 / span 1`
      // As a reminder, grid-area is shorthand, so you can call any one of it's constituent properties (e.g. grid-row-start), and get one of these numbers back
    }
  
    adjustRow (row) {
      // used for hovering
      this.row = this.row + row
    }
  
    adjustCol (col) {
      // shouldn't really be needed
      this.col = this.col + col
    }
  
    setRow (row) {
      this.row = this.convertRow(row)
    }
  
    setCol (col) {
      this.col = col
    }
    convertRow (row) {
      // Top of game board is row 6
      // Bottom of game board is row 20
      // To make it simple, we'll number rows 1 as the top, and row 15 as the bottom
      return 21 - row
    }
  
    convertCol (col) {
      // leftmost column is 3
      // rightmost column is 5
      return col + 2
    }
    determineColor () {
      var colors = [
        'seagreen',
        'darkcyan',
        'peachpuff',
        'chocolate',
        'cornflowerblue',
        'darkkhaki',
        'darkslateblue',
        'darkseagreen',
        'green',
        'goldenrod',
        'indianred',
        'lightslategrey',
        'olive',
        'royalblue',
        'saddlebrown'
      ]
      this.color = colors[this.diskNum - 1]
    }
  
    calculateWidth () {
      this.width = this.sizeInc + this.diskNum * this.sizeInc
    }
  }
  
  function instantiateDiskProperties () {}
  // End Disk Class
  
  // Game Variables
  
  var gameVars = {
    minDisks: 3,
    numDisks: 5,
    maxDisks: 15,
    diskHovering: false,
    diskHoveringWhere: null,
    previouslyClickedTower: null,
    moves: 0,
    minMoves: 0,
    timeout: 1000
  }
  
  var disks = {
    // Names like this to avoid doing more unnecessary math when figuring out column that disk sits i
    'tower-3': [],
    'tower-4': [],
    'tower-5': [],
    diskHeight: 30,
    towerHeight: function () {
      return this.diskHeight * (gameVars.numDisks + 2)
    }
  }
  
  // End Game Variables
  
  // GAME START //
  function initializeParameters () {
    $('diskRange').attr({
      min: gameVars.minDisks,
      max: gameVars.maxDisks
    })
  }
  
  function changeDisks (newDiskNum) {
    gameVars.numDisks = parseInt(newDiskNum)
    resetGame()
    updateDiskCounter()
  }
  
  function resetGame () {
    $('.game-piece').remove()
    gameVars.moves = 0
    gameVars.gameComplete = false
    gameVars.minMoves = Math.pow(2, gameVars.numDisks) - 1
    $('#minimumMoves').html(`Minimum Moves: ${gameVars.minMoves}`)
    updateMoves()
  
    initializeParameters()
    initialGenerateDisks()
    generateEventListeners()
  }
  
  resetGame()
  // END GAME START //
  
  // MODEL CONTROLLER //
  
  function initialGenerateDisks () {
    disks['tower-3'] = []
    disks['tower-4'] = []
    disks['tower-5'] = []
    let row = 1,
      col = 1
    // Set tower height
    $('.tower').css('height', `${disks.towerHeight()}px`)
    // Loop through in reverse order to stack properly
    for (let i = gameVars.numDisks; i > 0; i--) {
      // Instantiate new disk, store to disks object
      disks[`disk-${i}`] = new Disk(i, row, col)
      // store this new disk in a variable for use in this loop
      let newDisk = disks[`disk-${i}`]
      // Increment row
      row++
      // create new div
      let newDiv = $('<div></div>')
      // set ID for later usage
      newDiv.attr({
        id: `disk-${newDisk.diskNum}`,
        class: 'game-piece'
      })
      // Append blank div to game-container
      newDiv.appendTo($('.game-container'))
      // Push new disk's number to array for later validation. They're pushed in opposite order so popping will always return the top disk
      disks[`tower-${newDisk.col}`].push(newDisk)
      // Modify new div's CSS to get it to show up in the correct place
      newDiv.css({
        'background-color': newDisk.color,
        height: '95%',
        width: `${newDisk.width}%`,
        'grid-area': newDisk.calculatePosition(),
        'justify-self': 'center',
        'align-self': 'end',
        'z-index': 3,
        border: '1px solid black',
        'border-radius': '10px'
      })
    }
  }
  // Generate boxes with event listeners to wait for click events
  function generateEventListeners () {
    for (let i = 3; i < 6; i++) {
      // create new tower listener. Just a blank div
      newTower = $('<div></div>', {
        id: `tower-${i}`
      })
      // add div to game board
      $('.game-container').append(newTower)
      // attach event listener
      newTower.on('click', function () {
        gameVars.previouslyClickedTower = $(this).attr('id')
        diskHover($(this).attr('id'))
        updateView()
      })
      // add game-piece class to event listeners
      newTower.attr('class', 'game-piece')
      // Change CSS to make it fit the proper dimensions
      newTower.css({
        'grid-row': '5 / span 16',
        // Applies to columns 3, 4, and 5
        'grid-column': `${i} / span 1`,
        height: '100%',
        width: '95%',
        'justify-self': 'center',
        // make sure it's on top of everything else
        'z-index': '10'
      })
    }
  }
  
  function diskHover (towerID) {
    // grabs top-most disks from tower array
    // logic check for origin tower or destination tower
    if (gameVars.diskHoveringWhere != null) {
      // there is an origin tower, and this run will be to place the disk in a new place
      var topDisk = disks[gameVars.diskHoveringWhere]
      topDisk = topDisk[topDisk.length - 1]
    } else {
      // there is no origin tower, yet
      var topDisk = disks[towerID]
      gameVars.diskHoveringWhere = towerID
      topDisk = topDisk[topDisk.length - 1]
    }
    // checks if a disk is already hovering
    // checks if the clicked tower has any disks
    if (!gameVars.diskHovering && disks[towerID].length > 0) {
      // flags for a hovering disk
      gameVars.diskHovering = true
      // sets origin tower of newly hovering disk
      gameVars.diskHoveringWhere = towerID
      // changes disks row number to row-1
      topDisk.adjustRow(-1)
    } else if (gameVars.diskHovering) {
      if (towerID === gameVars.diskHoveringWhere) {
        // Condition where origin tower equals destination tower
        // remove hovering flag
        gameVars.moves++
        gameVars.diskHovering = false
        // lowers disk
        topDisk.adjustRow(1)
        // null out origin tower
        gameVars.diskHoveringWhere = null
      } else {
        // origin and destination are different
        // if destination tower is empty, just place it
        if (disks[towerID].length === 0) {
          // swap disks using tower origin ID, and tower destination ID
          swapDisks(topDisk, towerID)
        } else {
          if (checkDiskSize(topDisk, towerID)) {
            swapDisks(topDisk, towerID)
          } else {
            // if this test fails, the disk will just set itself back down with no other feedback
            diskHover(gameVars.diskHoveringWhere)
          }
        }
      }
    }
  }
  
  function swapDisks (topDisk, towerDestination, automaticFlag = false) {
    if (automaticFlag) {
      // This chunk of code cna ONLY run when you solve the program recursively. The main body of the ode should never set automaticFlag to true
      // topDisk is now towerSrc
      var updateInc = 0
      let towerSource = topDisk
      // pop topDisk and save it
      topDisk = disks[towerSource].pop()
      // push topDisk to destination
      disks[towerDestination].push(topDisk)
    } else {
      disks[gameVars.diskHoveringWhere].pop()
      disks[towerDestination].push(topDisk)
    }
    gameVars.moves++
    gameVars.diskHovering = false
    // Returns 3-5
    topDisk.setCol(towerDestination[towerDestination.length - 1])
    // returns relative row, sets to absolute row
    topDisk.setRow(disks[towerDestination].length)
    // Since no disk is hovering, origin is nulled
    gameVars.diskHoveringWhere = null
  }
  function checkDiskSize (topDisk, towerID) {
    // if passed disk's number is less than that of the destination tower's top-most disk's number, return true
    let destinationDiskNum = disks[towerID]
    destinationDiskNum = destinationDiskNum[destinationDiskNum.length - 1].diskNum
    if (topDisk.diskNum < destinationDiskNum) {
      return true
    }
    return false
  }
  // END MODEL CONTROLLER //
  
  // VIEW CONTROLLER //
  // Updates all disks at once accounting for all changes that may occur during game play. Heavy overhead, especially for a large number of disks, but I've capped this game at 15, so it shouldn't be a problem
  function updateView () {
    for (let i = 3; i < 6; i++) {
      let tower = disks[`tower-${i}`]
      for (let j = 0; j < tower.length; j++) {
        let disk = tower[j]
        $(`#disk-${disk.diskNum}`).css({
          'grid-area': `${disk.calculatePosition()}`
        })
      }
    }
    updateMoves()
    winCondition()
  }
  
  function updateMoves () {
    $('#moveCounter').html(`Moves: ${gameVars.moves}`)
  }
  
  function updateDiskCounter () {
    $('#diskCounter').html(`${gameVars.numDisks} Disks`)
  }
  
  function winCondition () {
    if (disks['tower-3'].length === 0 && disks['tower-4'].length === 0) {
      // alert("You Win!")
      // Add game win box
      let winBanner = $('<div></div>')
      winBanner.attr('class', 'game-win game-piece')
      winBanner.html('<h3>You Win!</h3>')
      winBanner.appendTo($('.game-container'))
      // add cover to prevent further user input
      let gameBlock = $('<div></div>')
      gameBlock.attr('class', 'game-block game-piece')
      gameBlock.appendTo($('.game-container'))
      $('.game-block').css('display', 'block')
      // gameComplete flag for recursive function
      gameVars.gameComplete = true
    }
  }
  // END VIEW CONTROLLER //
  
  // RECURSIVE CONTROLLER //
  
  function solveRecursively (height, source, destination, buffer) {
    if (height === 0) {
      swapDisks(source, destination, true)
      updateView()
    } else {
      solveRecursively(height - 1, source, buffer, destination)
      // Can't figure ot why the game runs once more after finishing, this fixes that problem
      if (gameVars.gameComplete) {
        return
      }
      swapDisks(source, destination, true)
      updateView()
      solveRecursively(height - 1, buffer, destination, source)
    }
  }
  
  // END RECURSIVE CONTROLLER //