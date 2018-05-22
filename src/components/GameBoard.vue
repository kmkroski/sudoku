<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <router-link class="navbar-brand" to="/">
        <i class="icon ion-md-arrow-back mr-3 ml-2"></i>
        {{ ['Easy', 'Medium', 'Hard', 'Insane'][level - 1] }}
      </router-link>
    </nav>

    <div class="container py-2">
      <div class="board px-2 text-center">
        <div class="row" v-for="y in 9" :key="y">
          <div v-for="x in 9" :key="y * 9 + x"
            :class="{
              'col cell': true,
              'right-border': x % 3 === 0 && x !== 9,
              'bottom-border': y % 3 === 0 && y !== 9,
              'original': cells[((y - 1) * 9) + (x - 1)].original,
              'active': selected === ((y - 1) * 9) + (x - 1),
              'error': checkCellByXY(x - 1, y - 1),
            }"
            @click="selectCell(x - 1, y - 1)"
          >
            <div class="cell-content">
              {{ cells[((y - 1) * 9) + (x - 1)].value || '' }}
            </div>

            <div class="guesses">
              {{ cells[((y - 1) * 9) + (x - 1)].guesses.join(' ') }}
            </div>
          </div>
        </div>
      </div>

      <div class="user-input mt-3">
        <div class="d-flex justify-content-end">
          <button
            class="btn btn-action btn-block btn-outline-danger mr-3"
            @click="clearCell"
          >
            <i class="icon ion-md-close"></i>
            <span>Clear</span>
          </button>

          <button
            :class="{
              'btn btn-action btn-block mt-0': true,
              'btn-primary': guess,
              'btn-outline-primary': !guess,
            }"
            @click="activateGuessMode"
          >
            <i class="icon ion-md-create"></i>
            <span>Guess {{ guess ? 'On' : 'Off' }}</span>
          </button>
        </div>

        <div class="row mt-3 px-1">
          <div
            v-for="i in 9" :key="i"
            class="col p-1"
          >
            <button
              class="btn btn-block btn-link btn-value"
              @click="setCellValue(i)"
            >
              {{ i }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameBoard',
  data() {
    return {
      cells: [],
      selected: 40,
      guess: false,
      level: 0,
    };
  },
  created() {
    this.setup();

    document.getElementsByTagName('body')[0].removeEventListener('keyup', this.keyHandler);
    document.getElementsByTagName('body')[0].addEventListener('keyup', this.keyHandler);
  },
  methods: {
    keyHandler() {
      // Numbers
      if (event.keyCode >= 49 && event.keyCode <= 57) {
        this.setCellValue(event.keyCode - 48);
      }

      // Directions
      if (event.keyCode === 38) {
        this.selected -= 9;
      } else if (event.keyCode === 40) {
        this.selected += 9;
      } else if (event.keyCode === 37) {
        this.selected -= 1;
      } else if (event.keyCode === 39) {
        this.selected += 1;
      }
      this.selected = Math.min(Math.max(0, this.selected), 80);

      // Guess
      if (event.keyCode === 71) {
        this.activateGuessMode();
      }

      // Clear
      if (event.keyCode === 88) {
        this.clearCell();
      }
    },
    setup() {
      this.cells = [];
      this.selected = 40;
      this.guess = false;
      this.level = this.$localStorage.get('level');

      if (!this.level) {
        this.level = 1;
      }

      this.loadPuzzle();
      if (this.cells.length <= 0) {
        this.generatePuzzle();
      }
    },

    getCellAddress(x, y) {
      return (y * 9) + x;
    },
    getCellContents(x, y) {
      return this.cells[this.getCellAddress(x, y)];
    },
    selectCell(x, y) {
      if (this.getCellContents(x, y).original) {
        return;
      }

      this.selected = this.getCellAddress(x, y);
    },
    activateGuessMode() {
      this.guess = !this.guess;
    },
    setCellValue(value) {
      if (this.selected < 0 || this.cells[this.selected].original) {
        return;
      }

      if (this.guess) {
        let guesses = this.cells[this.selected].guesses;
        if (guesses.indexOf(value) !== -1) {
          guesses.splice(guesses.indexOf(value), 1);
        } else {
          guesses.push(value);
        }

        guesses = guesses.filter((v, i, a) => a.indexOf(v) === i);
        guesses = guesses.sort();

        const newCell = Object.assign({}, this.cells[this.selected], {
          value: 0,
          guesses,
        });
        this.$set(this.cells, this.selected, newCell);
      } else {
        const newCell = Object.assign({}, this.cells[this.selected], {
          value,
          guesses: [],
        });
        this.$set(this.cells, this.selected, newCell);
      }

      this.checkPuzzle();
    },
    clearCell() {
      if (this.selected < 0 || this.cells[this.selected].original) {
        return;
      }

      const newCell = Object.assign({}, this.cells[this.selected], {
        value: 0,
        guesses: [],
      });
      this.$set(this.cells, this.selected, newCell);
    },
    checkPuzzle() {
      let success = true;
      for (let i = 0; i < this.cells.length; i += 1) {
        if (
          !this.cells[i].original &&
          (this.checkCellByAddress(i) || this.cells[i].value === 0)
        ) {
          success = false;
        }
      }

      this.savePuzzle(success);

      if (success) {
        this.$swal({
          title: 'Awesome',
          text: 'You solved the puzzle!',
          type: 'success',
          showCancelButton: true,
          confirmButtonText: 'Next Puzzle',
          cancelButtonText: 'Home',
        }).then((result) => {
          if (result.value) {
            window.location.reload();
          } else {
            this.$router.push('/');
          }
        });
      }
    },

    savePuzzle(complete) {
      if (!complete) {
        this.$localStorage.set('game', JSON.stringify(this.cells));
      } else {
        this.$localStorage.remove('game');
      }
    },
    loadPuzzle() {
      const board = this.$localStorage.get('game');
      if (board) {
        this.cells = JSON.parse(board);
      } else {
        this.cells = [];
      }
    },

    checkCellByXY(x, y) {
      const address = this.getCellAddress(x, y);
      return this.checkCellByAddress(address);
    },
    checkCellByAddress(address) {
      const value = this.cells[address].value;

      if (value === 0) {
        return false;
      }

      // row
      const row = Math.floor(address / 9);
      for (let i = 0; i < 9; i += 1) {
        const j = (row * 9) + i;
        if (this.cells[j].value === value && j !== address) {
          return true;
        }
      }

      // col
      const col = address % 9;
      for (let i = 0; i < 9; i += 1) {
        const j = (i * 9) + col;
        if (this.cells[j].value === value && j !== address) {
          return true;
        }
      }

      // square
      const r = row - (row % 3);
      const c = col - (col % 3);
      for (let i = r; i < r + 3; i += 1) {
        for (let j = c; j < c + 3; j += 1) {
          const a = this.getCellAddress(j, i);
          if (this.cells[a].value === value && a !== address) {
            return true;
          }
        }
      }

      return false;
    },

    getAvailable(matrix, cell, avail) {
      let j;
      const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0];

      const col = cell % 9;
      let row = Math.floor(cell / 9);

      // row
      for (let i = 0; i < 9; i += 1) {
        j = (row * 9) + i;
        if (matrix[j] > 0) {
          arr[matrix[j] - 1] = 1;
        }
      }

      // col
      for (let i = 0; i < 9; i += 1) {
        j = (i * 9) + col;
        if (matrix[j] > 0) {
          arr[matrix[j] - 1] = 1;
        }
      }

      // square
      let r = row - (row % 3);
      let c = col - (col % 3);
      for (let i = r; i < r + 3; i += 1) {
        for (j = c; j < c + 3; j += 1) {
          if (matrix[(i * 9) + j] > 0) {
            arr[matrix[(i * 9) + j] - 1] = 1;
          }
        }
      }

      j = 0;
      if (avail !== null) {
        for (let i = 0; i < 9; i += 1) {
          if (arr[i] === 0) {
            avail[j] = i + 1;
            j += 1;
          }
        }
      } else {
        for (let i = 0; i < 9; i += 1) {
          if (arr[i] === 0) {
            j += 1;
          }
        }
        return j;
      }

      if (j === 0) {
        return 0;
      }

      for (let i = 0; i < 18; i += 1) {
        r = Math.floor(Math.random() * j);
        c = Math.floor(Math.random() * j);
        row = avail[r];
        avail[r] = avail[c];
        avail[c] = row;
      }

      return j;
    },

    getCell(matrix) {
      let cell = -1;
      let n = 10;
      let j;

      for (let i = 0; i < 81; i += 1) {
        if (matrix[i] === 0) {
          j = this.getAvailable(matrix, i, null);

          if (j < n) {
            n = j;
            cell = i;
          }

          if (n === 1) {
            break;
          }
        }
      }

      return cell;
    },

    /* eslint no-param-reassign: ["error", { "props": false }] */
    generate(matrix) {
      const avail = [0, 0, 0, 0, 0, 0, 0, 0, 0];

      const cell = this.getCell(matrix);
      if (cell === -1) {
        return 1;
      }

      const j = this.getAvailable(matrix, cell, avail);
      for (let i = 0; i < j; i += 1) {
        matrix[cell] = avail[i];

        if (this.generate(matrix) === 1) {
          return 1;
        }
      }

      matrix[cell] = 0;
      return 0;
    },

    generatePuzzle() {
      const matrix = [];
      for (let i = 0; i < 81; i += 1) {
        matrix[i] = 0;
      }

      this.generate(matrix);
      matrix.forEach((el, idx) => {
        this.cells[idx] = {
          value: el,
          original: true,
          guesses: [],
        };
      });

      const levelCount = 20 + (this.level * 10);
      do {
        const idx = Math.floor(Math.random() * 81);
        this.cells[idx] = {
          value: 0,
          original: false,
          guesses: [],
        };
      } while (
        Object.values(this.cells).filter(el => !el.original).length < levelCount
      );

      this.savePuzzle(false);
    },
  },
};
</script>

<style scoped>
.board > div {
  border-left: 2px solid #333;
  border-right: 2px solid #333;
}
.board > div:first-of-type {
  border-top: 2px solid #333;
}
.board > div:last-of-type {
  border-bottom: 2px solid #333;
}

.cell {
  position: relative;
  padding-bottom: 11.111%;
  margin: 0;
  color: #000;
  border-right: 1px solid #bdc3c7;
  border-bottom: 1px solid #bdc3c7;
}
.cell:last-of-type {
  border-right: none;
}
.cell.right-border {
  border-right: 2px solid #333;
}
.cell.bottom-border {
  border-bottom: 2px solid #333;
}
.board > div:last-of-type > .cell {
  border-bottom: none;
}

.cell.original {
  background-color: #ecf0f1;
}
.cell.error {
  color: #ff3f34 !important;
}
.cell.active:not(.original) {
  background-color: #17c0eb;
  color: #fff;
}

.cell > .cell-content {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  margin-top: -14px;
  font-size: 24px;
  line-height: 28px;
}

.cell > .guesses {
  position: absolute;
  left: 0;
  top: 1px;
  right: 0;
  font-size: 11px;
  line-height: 14px;
  letter-spacing: 2px;
}

.btn-value {
  padding: 0;
  font-size: 32px;
}

.btn-action > i.icon {
  float: left;
  font-size: 24px; line-height: 24px;
}
</style>
