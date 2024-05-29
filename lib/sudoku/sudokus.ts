import { sortBy, groupBy, flatten } from "lodash-es"
import { SimpleSudoku } from "./common"

export const isSudokuFilled = (sudoku: SimpleSudoku): boolean => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (sudoku[i][j] === 0) return false
    }
  }
  return true
}

export const isSudokuValid = (sudoku: SimpleSudoku): boolean => {
  // Check rows.
  for (let i = 0; i < 9; i++) {
    const row = sudoku[i]
    const set = new Set(row)
    set.delete(0)
    if (set.size !== row.filter((n) => n !== 0).length) return false
  }

  // Check columns.
  for (let i = 0; i < 9; i++) {
    const column = sudoku.map((row) => row[i])
    const set = new Set(column)
    set.delete(0)
    if (set.size !== column.filter((n) => n !== 0).length) return false
  }

  // Check squares.
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const square = []
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          square.push(sudoku[i * 3 + k][j * 3 + l])
        }
      }
      const set = new Set(square)
      set.delete(0)
      if (set.size !== square.filter((n) => n !== 0).length) return false
    }
  }

  return true
}

// Most simple solver. Basically a brute force.
export function bruteForceStrategy(sudoku: SimpleSudoku): SimpleSudoku[] {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (sudoku[i][j] === 0) {
        // We try all numbers from 1 to 9.
        const newSudokus = []
        for (let k = 1; k <= 9; k++) {
          const newSudoku = sudoku.map((row) => row.slice())
          newSudoku[i][j] = k
          newSudokus.push(newSudoku)
        }
        return newSudokus
      }
    }
  }

  return []
}

// Slightly better, we skip the invalid sudokus.
export function withValidCheckStrategy(sudoku: SimpleSudoku): SimpleSudoku[] {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (sudoku[i][j] === 0) {
        // We try all numbers from 1 to 9.
        const newSudokus = []
        for (let k = 1; k <= 9; k++) {
          const newSudoku = sudoku.map((row) => row.slice())
          newSudoku[i][j] = k
          if (isSudokuValid(newSudoku)) {
            newSudokus.push(newSudoku)
          }
        }
        return newSudokus
      }
    }
  }

  return []
}

// function dfs(
//   stack: SimpleSudoku[],
//   strategy: (sudoku: SimpleSudoku) => SimpleSudoku[],
// ): [SimpleSudoku | null, SimpleSudoku[]] {
//   if (stack.length === 0) return [null, []]

//   const [sudoku, ...rest] = stack

//   const isFilled = isSudokuFilled(sudoku)
//   const isValid = isSudokuValid(sudoku)

//   if (isFilled && isValid) return [sudoku, []]

//   const newSudokus = strategy(sudoku)

//   return dfs([...newSudokus, ...rest], strategy)
// }

const getEmptyCoordinates = (sudoku: SimpleSudoku): [number, number][] => {
  const emptyCoordinates: [number, number][] = []
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (sudoku[i][j] === 0) {
        emptyCoordinates.push([i, j])
      }
    }
  }
  return emptyCoordinates
}

export function minimumRemainingValueStrategy(
  sudoku: SimpleSudoku,
): SimpleSudoku[] {
  const emptyCoordinates = getEmptyCoordinates(sudoku)

  // For every coordinate, calculate the number of possibilities.
  const possibilities = emptyCoordinates.map(([i, j]) => {
    const row = sudoku[i]
    const column = sudoku.map((row) => row[j])
    const square = []
    for (let k = 0; k < 3; k++) {
      for (let l = 0; l < 3; l++) {
        square.push(sudoku[i - (i % 3) + k][j - (j % 3) + l])
      }
    }
    const set = new Set([...row, ...column, ...square])
    set.delete(0)
    return [i, j, 9 - set.size]
  })

  // Sort by the number of possibilities.
  const sortedPossibilities = possibilities.sort((a, b) => a[2] - b[2])

  // We take the first coordinate with the least possibilities.
  const [i, j] = sortedPossibilities[0]
  const newSudokus = []
  for (let k = 1; k <= 9; k++) {
    const newSudoku = sudoku.map((row) => row.slice())
    newSudoku[i][j] = k
    if (isSudokuValid(newSudoku)) {
      newSudokus.push(newSudoku)
    }
  }

  return newSudokus
}
