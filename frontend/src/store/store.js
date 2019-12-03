import Vue from 'vue'
import Vuex, { Store } from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state:{
    testName:'',
    challengers:[],
    scene:'HostWelcome',
    numberMask:[],
    letterMask:[],
    topFour:[],
    finalists: [],
    champion: [],//the top two challengers
    playerCount: 1,
    role:'guest',
    roomNum:'',
    readyCount:0,
    categoryChoice:[],
    remainingChallengers:[], //remaining challengers to rate in Melee rating populates in stateSetup
    currentChallenger:null,
    finalReveal: {
      'loser':false,
      'third':false,
      'second':false,
      'first':false,
    },

    finalRevealChallengers:[],

  },
  mutations:{
    addChallengers(state, challengers){
      state.role = 'host'
      state.challengers = challengers.map(challenger => {
        return {
          'challenger':challenger,
          'scores':[],
          challengerNumber: null,
          challengerLetter: '',
          average: null,
          semiScores: [],
          semiAvg: null,
          finalScores: [],
          finalAvg: null,
      }
      })
    },
    maskChallengers(state){
      // state.maskedChallengers = state.challengers.map(product => {})

      let challengerGoBetween = state.challengers.slice(0)

      let alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

      while (challengerGoBetween.length > 0) {
        let randomChallengerIndex = Math.floor(Math.random()*challengerGoBetween.length)
        let selectedChallenger = challengerGoBetween[randomChallengerIndex]
        state.numberMask.push(selectedChallenger)
        challengerGoBetween.splice(challengerGoBetween.indexOf(selectedChallenger), 1)

        for (let challenger of state.challengers) {
          challenger.challengerNumber = state.numberMask.indexOf(challenger)+1
        }
      }

      let letterGoBetween = state.numberMask.slice(0)

      while (letterGoBetween.length > 0) {
        let randomChallengerIndex = Math.floor(Math.random()*letterGoBetween.length)
        let selectedChallenger = letterGoBetween[randomChallengerIndex]
        state.letterMask.push(selectedChallenger)
        letterGoBetween.splice(letterGoBetween.indexOf(selectedChallenger), 1)

        for (let challenger of state.challengers) {
          challenger.challengerLetter = alphabet[state.letterMask.indexOf(challenger)]
        }
      }
      //setup state.remainingChalleters
      // Durstenfield Shuffle algorithm
      let shuffledArray = state.challengers.slice()
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
      }
      console.log(shuffledArray)
      //setup state.currentChallenger
      state.currentChallenger = shuffledArray.pop()
      state.remainingChallengers = shuffledArray
    },
    changeScene(state, scene) {
      state.scene = scene
    },
    grabCategory(state, category){
      state.categoryChoice = category
    },
    notifyReady(state){
      state.readyCount += 1
    },
    addPlayer(state){
      if (state.role === 'host'){
        state.playerCount += 1
        state.newSocket.send(JSON.stringify({
          'method':'setPlayers',
          'payload':state.playerCount
        }))
        state.newSocket.send(JSON.stringify({
          method:'setupState',
          payload: state
        }))
      }
    },
    removePlayer(state){
      if (state.role === 'host'){
        state.playerCount -= 1
        state.newSocket.send(JSON.stringify({
          'method':'setPlayers',
          'payload':state.playerCount
        }))
      }
    },
    setCategory(state, category){
      state.category = category
    },
    setPlayers(state, hostCount){
      if (state.role !== 'host'){
        state.playerCount = hostCount
      }
    },
    addScore(state, submission){
      for (let challenger of state.challengers){
        if (challenger.challenger === submission.challenger) {
          challenger.scores.push(submission.rating)
          challenger.average = challenger.scores.reduce((a, b) => a + b, 0) / challenger.scores.length
        }
      }
    },
    resetMeleeScoreCount(state){
      state.readyCount = 0
    bulkRanking(state, rankedChallengers){
      state.challengers.map(challenger => {
        for (let incoming of rankedChallengers){
          if (challenger.challenger === incoming.challenger){
            challenger.scores.push(incoming.rating)
            challenger.average = challenger.scores.reduce((a, b) => a + b, 0) / challenger.scores.length
          }
        }
        return challenger
      })
    },
    addSemiScores(state, semiChallenger) {
      for (let challenger of state.challengers) {
        if (challenger.challenger === semiChallenger.challenger) {
          challenger.semiScores.push(semiChallenger.rating)
          challenger.semiAvg = challenger.semiScores.reduce((a, b) => a + b, 0) / challenger.semiScores.length
        }
      }
    },
    addFinalistScores(state, finalChallenger) {
      for (let challenger of state.challengers) {
        if (challenger.challenger === finalChallenger.challenger) {
          challenger.finalScores.push(finalChallenger.rating)
          challenger.finalAvg = challenger.finalScores.reduce((a, b) => a + b, 0) / challenger.finalScores.length
        }
      }
    },
    setTopFour(state){
        let sorted = state.challengers.sort((a, b) => (b.average - a.average))
        state.challengers = sorted
        state.topFour = sorted.slice(0,4)
    },
    setDirectHeadToHead(state){
      state.topFour = state.challengers.slice()
    },
    openSocket(state, socket){
      state.newSocket = socket
    },
    printData(state, payload){
      console.log(payload)
    },
    setFinalists(state){
      let sorted = state.challengers.sort((a, b) => (b.semiAvg - a.semiAvg))
      state.finalists = sorted.slice(0, 2)
    },
    setChampion(state) {
      let sorted = state.finalists.sort((a, b) => (b.finalAvg - a.finalAvg))
      state.champion = sorted.slice(0,2) 
    },
    setShortChallengeChamp(state){
      let sorted = state.challengers.sort((a, b) => (b.semiAvg - a.semiAvg))
      state.champion = sorted.slice()
    },
    setupState(state, payload){
      state.testName = payload.testName
      state.challengers = payload.challengers
      state.remainingChallengers = payload.remainingChallengers 
      state.currentChallenger = payload.currentChallenger
    }, 
    saveRoomNumber(state, roomNum){
      state.roomNum = roomNum
    },
    sendNextChallenger(state, nextChallenger){
      state.currentChallenger = nextChallenger
    },
    chooseNextChallenger(state){
      state.currentChallenger = state.remainingChallengers.pop()
    },
    setupFinalReveal(state, total, sortedChallengers){
      // if(total >= 3) state.finalReveal['third'] = false
      // if(total >= 4) state.finalReveal['loser'] = false
      state.finalRevealChallengers = sortedChallengers
      
    },
    revealNext(state){
      // console.log(state.finalReveal)
      // state.finalReveal['loser'] = !state.finalReveal['loser']
      for(let index in state.finalReveal){
        if(state.finalReveal[index] === false){
          state.finalReveal[index] = true
          break
        }
      }
    },
  },
  getters: {
    getTopFour(state) {
      return state.topFour.slice()
    },
    getFinalists(state) {
      return state.finalists.slice()
    },
    getChampion(state) {
      return state.champion.slice()
    },
    getChallengersByNumber(state){
      return state.challengers.sort((a,b)=> (a.challengerNumber - b.challengerNumber)).slice()
    },
    getRole(state){
      return state.role
    },
    getChallengers(state){
      // let challengers = state.challengers.sort((a, b) => (b.average - a.average)).slice()
      // challengers.splice(challengers.indexOf(state.champion[0],1))
      // challengers.unshift(state.champion[0])
      return state.challengers.map(a => a)
    },
    getAvgScore(state){
      return state.challengers.map(a => a.average)
    },
    getPlayerCount(state){
      return state.playerCount
    },
    getRoomNum(state){
      return state.roomNum
    },
    getReadyPlayers(state){
      return state.readyCount
    },
    getCurrentChallenger(state){
      console.log(state.currentChallenger)
      return state.currentChallenger
    },
    // getNextChallenger(state){
    //   //if remaining challengers.length === 0 it returns undefined
      
    //   return state.remainingChallengers.pop()
    // },
    getFinalRevealChallengers(state){
      return state.finalRevealChallengers
    },
    getFirstReveal(state){
      return state.finalReveal['first']
    },
    getSecondReveal(state){
      return state.finalReveal['second']
    },
    getThirdReveal(state){
      return state.finalReveal['third']
    },
    getLoserReveal(state){
      return state.finalReveal['loser']
    },

  },
  actions:{
    createSocket({commit, dispatch, state}){
      const roomNum = Math.floor(100000 + Math.random()*900000)
      
      const newSocket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/' + roomNum + '/'
      )
      newSocket.onopen = function(event){
        commit('saveRoomNumber', roomNum)
      }
      newSocket.onmessage = function(event) {
        dispatch('handleSocket', (JSON.parse(event.data)))
      }
      commit('openSocket', newSocket)
    },
    joinSocket({commit, dispatch}, roomNum){
      const newSocket = new WebSocket(
        'ws://'+ window.location.host + 
        '/ws/' + roomNum + '/'
      )
      newSocket.onopen = function(event){
        newSocket.send(JSON.stringify({
          'method':'addPlayer',
          'payload':null
        }))
      }
      newSocket.onmessage = function(event){
        dispatch('handleSocket', (JSON.parse(event.data)))
      }
      commit('openSocket', newSocket)
    },
    handleSocket({commit, state}, data){
      console.log("now logging")
      console.log(data)
      commit(data.method, data.payload)
    }
  }
})