import { defineStore } from 'pinia'

export const useScoreboardStore = defineStore('scoreboard', {
  state: () => ({
    // 🕒 Categoría y tiempo principal
    category: 'mayores', // infantil, sub15, mayores
    baseTime: 240, // segundos base
    time: 240,
    isRunning: false,
    isGolden: false,
    awaitingGolden: false,
    interval: null,
    pausedAt: null,
    showGoldenText: false,

    // 🥋 Puntuaciones
    white: { ippon: 0, waza: 0, yuko: 0, shido: 0 },
    blue: { ippon: 0, waza: 0, yuko: 0, shido: 0 },
    derivedFromWaza: { white: false, blue: false },
    // 🧩 Osaekomi timers
    osaekomi: {
      white: { seconds: 0, running: false, interval: null, lastStep: null },
      blue: { seconds: 0, running: false, interval: null, lastStep: null },
    },

    // 🏁 Estado de combate
    winner: null,
  }),

  getters: {
    formattedTime: (state) => {
      const m = Math.floor(state.time / 60)
        .toString()
        .padStart(2, '0')
      const s = (state.time % 60).toString().padStart(2, '0')
      return `${m}:${s}`
    },
  },

  actions: {
    // =========================
    // ⏱️ CONTROL DEL RELOJ
    // =========================
    toggleTimer() {
      if (this.winner) return

      // Si estaba esperando Golden Score y presionan play → iniciar
      if (this.awaitingGolden && this.isGolden && !this.isRunning) {
        this.awaitingGolden = false
        this.isRunning = true
        this.startInterval()
        return
      }

      // Normal play / pause
      this.isRunning = !this.isRunning
      if (this.isRunning) this.startInterval()
      else this.clearTimer()
    },

    startInterval() {
      if (this.interval) return
      this.interval = setInterval(() => {
        if (!this.isGolden) {
          if (this.time > 0) {
            this.time--
          } else {
            this.clearTimer()
            this.checkEndOfTime()
          }
        } else {
          this.time++
        }
      }, 1000)
    },

    clearTimer() {
      clearInterval(this.interval)
      this.interval = null
    },

    resetTimer() {
      this.clearTimer()
      const base = this.getBaseTime(this.category)
      this.time = base
      this.isGolden = false
      this.isRunning = false
      this.winner = null
      document.body.classList.remove('golden-score')
      this.showGoldenText = false
    },

    getBaseTime(cat) {
      return cat === 'infantil' ? 120 : cat === 'sub15' ? 180 : 240
    },

    setCategory(cat) {
      this.category = cat
      this.baseTime = this.getBaseTime(cat)
      this.time = this.baseTime
    },

    // =========================
    // 🥇 PUNTUACIONES
    // =========================
    incrementScore(side, type) {
      if (this.winner) return

      const player = this[side]
      const rival = side === 'white' ? this.blue : this.white

      player[type]++

      // 🟡 Golden Score: solo puntos técnicos deciden
      if (this.isGolden) {
        if (type === 'yuko' || type === 'waza' || type === 'ippon') {
          this.setWinner(side)
        }
        document.body.classList.remove('golden-score')
        this.showGoldenText = false

        // Shido NO decide aquí (solo si llegara a 3 más abajo)
      }

      // 🔹 Dos Waza-ari = Ippon automático
      if (type === 'waza' && player.waza >= 2) {
        player.waza = 0
        player.ippon = 1
        this.derivedFromWaza[side] = true
        this.setWinner(side)
        return
      }

      // 🔹 Tres Shido = Hansoku-make → Ippon rival
      if (player.shido >= 3) {
        rival.ippon = 1
        this.setWinner(side === 'white' ? 'blue' : 'white')
        return
      }

      this.checkWinner()
    },

    decrementScore(side, type) {
      const player = this[side]
      const rival = side === 'white' ? this.blue : this.white

      if (player[type] > 0) {
        player[type]--
      }

      // 🟡 Si estábamos en Golden Score y se revierte una puntuación ganadora
      if (this.isGolden && this.winner) {
        // ✅ Caso especial: si se revierte un shido que generó Hansoku-make
        if (type === 'shido' && player.shido < 3 && rival.ippon > 0) {
          rival.ippon = 0 // quitar ippon del rival
          this.winner = null
          this.isRunning = false
          return
        }

        // ✅ Si se revierte una puntuación técnica (yuko/waza/ippon)
        if (['yuko', 'waza', 'ippon'].includes(type)) {
          this.winner = null
          this.isRunning = false
          return
        }
      }

      // 🔹 Corrección normal de Shido (3 → 2): quitar ippon rival si era hansoku-make
      if (type === 'shido' && player.shido === 2 && rival.ippon > 0 && this.winner) {
        rival.ippon = 0
        this.winner = null
        this.isRunning = false
      }

      // 🔹 Corrección de Ippon por doble Waza-ari → restaurar 1 Waza
      if (type === 'ippon' && this.derivedFromWaza?.[side]) {
        this.derivedFromWaza[side] = false
        player.ippon = 0
        player.waza = 1
        this.winner = null
        this.isRunning = false
        return
      }

      // 🔹 Corrección del Waza que completó Ippon
      if (type === 'waza' && this.derivedFromWaza?.[side] && player.ippon > 0) {
        this.derivedFromWaza[side] = false
        player.ippon = 0
        player.waza = 1
        this.winner = null
        this.isRunning = false
        return
      }

      // 🔹 Ippon directo corregido
      if (type === 'ippon' && this.winner) {
        this.winner = null
        this.isRunning = false
      }

      this.checkWinner()
    },

    // =========================
    // 🧩 OSAEKOMI
    // =========================
    toggleOsaekomi(side) {
      const os = this.osaekomi[side]
      if (os.running) this.stopOsaekomi(side)
      else this.startOsaekomi(side)
    },

    startOsaekomi(side) {
      const os = this.osaekomi[side]
      const player = this[side]

      if (os.interval) return // ya corriendo

      os.running = true
      os.seconds = 0
      os.lastStep = null

      const alreadyHasWaza = player.waza > 0

      os.interval = setInterval(() => {
        os.seconds++

        // 5s → Yuko
        if (os.seconds === 5) {
          player.yuko++
          os.lastStep = 'yuko'

          if (this.isGolden) {
            this.setWinner(side)
            this.stopOsaekomi(side)
            return
          }
        }

        // 10s → Waza-ari (quita yuko generado por este osaekomi)
        if (os.seconds === 10) {
          if (os.lastStep === 'yuko' && player.yuko > 0) player.yuko--
          player.waza++
          os.lastStep = 'waza'

          // 🔸 Si ya tenía un Waza-ari → ahora es Ippon
          if (alreadyHasWaza) {
            player.waza = 0
            player.ippon++
            os.lastStep = 'ippon'
            this.derivedFromWaza[side] = true // 👈 marca origen
            this.setWinner(side)
            this.stopOsaekomi(side)
            return
          }

          if (this.isGolden) {
            this.setWinner(side)
            this.stopOsaekomi(side)
            return
          }
        }

        // 20s → Ippon (quita waza generado por este osaekomi)
        if (os.seconds === 20) {
          if (os.lastStep === 'waza' && player.waza > 0) player.waza--
          player.ippon++
          os.lastStep = 'ippon'
          this.derivedFromWaza[side] = true // 👈 marca origen
          this.setWinner(side)
          this.stopOsaekomi(side)
          return
        }
      }, 1000)
    },

    stopOsaekomi(side) {
      const os = this.osaekomi[side]
      clearInterval(os.interval)
      os.interval = null
      os.running = false
    },

    resetOsaekomi(side) {
      this.stopOsaekomi(side)
      const os = this.osaekomi[side]
      os.seconds = 0
      os.lastStep = null
    },

    // =========================
    // 🏁 REGLAS DE VICTORIA
    // =========================
    checkWinner() {
      // Si alguien tiene ippon → gana
      if (this.white.ippon > 0) this.setWinner('white')
      else if (this.blue.ippon > 0) this.setWinner('blue')
      else if (this.time === 0 && !this.isGolden) {
        this.checkEndOfTime()
      }
    },

    checkEndOfTime() {
      const whiteScore = this.totalScore(this.white)
      const blueScore = this.totalScore(this.blue)

      if (whiteScore > blueScore) {
        this.setWinner('white')
      } else if (blueScore > whiteScore) {
        this.setWinner('blue')
      } else {
        // 🔸 Empate → activar modo Golden Score visualmente
        this.awaitingGolden = true
        this.isRunning = false
        this.clearTimer()

        // 👇 Aquí el cambio clave
        this.isGolden = true // ✅ activa color y divs de Golden Score, pero sin iniciar tiempo
      }
    },

    setWinner(side) {
      this.clearTimer()
      this.stopOsaekomi('white')
      this.stopOsaekomi('blue')
      this.isRunning = false
      this.winner = side

      // 🟡 Si está en Golden Score, NO desactiva el modo
      // (para permitir reversión si se corrige la puntuación)
      if (!this.isGolden) {
        this.isGolden = false
        this.awaitingGolden = false
      }

      // limpiar color visual si ya es definitivo
      document.body.classList.remove('golden-score')
    },

    activateGoldenScore() {
      this.isGolden = true
      this.time = 0
      this.startInterval()
    },

    totalScore(obj) {
      return obj.ippon * 100 + obj.waza * 10 + obj.yuko - obj.shido
    },

    // =========================
    // 🔁 RESET GENERAL
    // =========================
    resetAll() {
      this.clearTimer()
      this.isGolden = false
      this.isRunning = false
      this.winner = null
      this.awaitingGolden = false
      this.white = { ippon: 0, waza: 0, yuko: 0, shido: 0 }
      this.blue = { ippon: 0, waza: 0, yuko: 0, shido: 0 }
      this.osaekomi.white = { seconds: 0, running: false, interval: null }
      this.osaekomi.blue = { seconds: 0, running: false, interval: null }
      this.time = this.baseTime
      document.body.classList.remove('golden-score')
      this.showGoldenText = false
    },
  },
})
