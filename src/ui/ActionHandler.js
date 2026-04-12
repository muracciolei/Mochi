/**
 * ActionHandler - Handles user interaction actions (Feed, Play, Talk, Sleep)
 * Integrates emotional system, animation, voice, tools, WebLLM, game, and audio
 */

const FUN_CONVERSATIONS = {
  en: {
    greetings: ['Heyyy!', 'Hiii!', 'Yoo!', 'Heeey!', 'Helloo!', 'Oh hi friend!', 'Yay you speak!', 'I hear you!', 'What up!', 'Greetings human!'],
    questions: ['How are you?', 'What are you doing?', 'Want to play?', 'Did you miss me?', 'Feeling hungry?', 'How was your day?', 'What did you do?', 'Tell me secrets!'],
    praise: ['You the best!', 'Love you so much!', 'My favorite human!', 'Best friend ever!', 'You make me happy!', 'Amazing human!', 'Worlds best!', 'I adore you!'],
    excitement: ['Wheee!', 'So cool!', 'Amazing!', 'Awesome!', 'Yay yay yay!', 'No WAY!', 'So awesome!', 'Incredible!', 'WOW!', 'Best thing ever!'],
    silly: ['Boop!', 'Squish!', 'Bloop!', 'Smooch!', 'Mwaa!', 'Poke!', 'Squishy!', 'Mochi blob!', 'Wiggle!', 'Jiggle!'],
    curiosity: ['Tell me more!', 'What else?', 'Ooh interesting!', 'Really?!', 'No way!', 'Tell tell!', 'I need details!', 'So cool!'],
    comfort: ['I love you!', 'We are friends!', 'Always here for you!', 'You are not alone!', 'Mochi loves you!', 'Hug!', 'You matter!', 'Im here!', 'Care!'],
    jokes: ['Why did the Mochi cross the road? To get to the OTHER side!', 'What do you call a smart Mochi? BrilliMochi!', 'Why is Mochi so happy? Because blobs are born to be fabulous!', 'How does Mochi stay fit?Squishercise!', 'What is Mochis favorite song? The Wiggle Wiggle song!'],
    roasts: ['Im a blob and I LOVE it!', 'Being round is my thing!', 'No legs, no worries!', 'SquiSHRAM!', 'I float, you wait!', 'Blob life is the BEST life!', 'Round and proud!'],
    compliments: ['Your voice is music!', 'Best human ever!', 'So happy we are friends!', 'You make this blob smile!', 'Gold star for you!', 'Ten out of ten!', 'Perfect!', 'A+!'],
    teases: ['Are you my favorite? YES!', 'Did someone say treats?!', 'I see you looking at me!', 'Want to squish me? Go ahead!', 'Im too cute for this!', 'Cant stop looking at me can you?!'],
    secrets: ['Between us? I love belly rubs!', 'My secret? I do squats in my sleep!', 'Dont tell: I think about food... CONSTANTLY!', 'I practice my wiggle face when alone!', 'My dream? A giant mochi mountain!']
  },
  es: {
    greetings: ['Holaaa!', 'Hiii!', 'Oye!', 'Wey!', 'Helloo!', 'Oh hola amigo!', 'Que gusto verte!', 'Que hay!', 'Saludos humano!'],
    questions: ['¿Cómo estás?', '¿Qué haces?', '¿Jugar?', '¿Me extrañas?', '¿Tienes hambre?', '¿Cómo te fue?', '¿Qué hiciste?', '¡Cuéntame!'],
    praise: ['¡El mejor!', '¡Te quiero mucho!', '¡Mi humano favorito!', '¡Mejor amigo!', '¡Me haces feliz!', '¡Increíble!', '¡Eres lo máximo!', '¡Te adoro!'],
    excitement: ['¡Yupi!', '¡Qué fuerte!', '¡Increíble!', '¡Awesome!', '¡Yay yay!', '¡No me digas!', '¡Qué padre!', '¡Último!', '¡Guau!', '¡Mejor cosa!'],
    silly: ['¡Boop!', '¡Squish!', '¡Bloop!', '¡Mua!', '¡Pukis!', '¡Poke!', '¡Squishy!', '¡Mochi blob!', '¡Wiggle!', '¡Saltito!'],
    curiosity: ['¡Cuéntame más!', '¿Qué más?', '¡Oh interesante!', '¿¡De verdad?!', '¡No way!', '¡Tell tell!', '¡Necesito detalles!', '¡Qué cool!'],
    comfort: ['¡Te quiero!', '¡Somos amigos!', '¡Siempre aquí!', '¡No estás solo!', '¡Mochi te quiere!', '¡Abrazo!', '¡Tú importas!', '¡Aquí estoy!'],
    jokes: ['¿Por qué el Mochi cruzó el camino? Para llegar al otro lado!', '¿Qué llamas a un Mochi inteligente? MochiBrilli!', '¿Por qué Mochi es feliz? Porque ser bola es lo mejor!'],
    roasts: ['¡Soy bola y LO AMO!', 'Ser redondo es MI cosa!', '¡Sin patas, sin preocupaciones!', '¡SquiSHRAM!', '¡Floto, túesperas!'],
    compliments: ['¡Tu voz es música!', '¡Mejor humano!', '¡Tan felices de ser amigos!', '¡Me haces sonreír!', '¡Estrella de oro!', '¡Diez de diez!'],
    teases: ['¿Eres mi favorito? SÍ!', '¿Alguien dijo treats?!', '¡Te veo mirándome!', '¿Quieres squishearme? Adelante!'],
    secrets: ['¿Entre nosotros? amo las cariñas!', '¡Mi secreto? pienso en comida CONSTANTEMENTE!']
  },
  it: {
    greetings: ['Ciaoo!', 'Hiii!', 'Ehi!', 'Ohi!', 'Ciaa!', 'Oh ciao amico!', 'Che bello vederti!', 'Ciao!', 'Saluti umano!'],
    questions: ['Come stai?', 'Cosa fai?', 'Giocare?', 'Mi sei mancato?', 'Fame?', 'Come è andata?', 'Cosa hai fatto?', 'Raccontami!'],
    praise: ['Sei il migliore!', 'Ti voglio bene!', 'Il mio umano preferito!', 'Migliore amico!', 'Mi rendi felice!', 'Incredibile!', 'Sei fantastico!', 'Ti adoro!'],
    excitement: ['Evviva!', 'Che figo!', 'Grandioso!', 'Awesome!', 'Evviva!', 'Non dire!', 'Che figo!', 'Top!', 'Wow!', 'Il massimo!'],
    silly: ['Boop!', 'Squish!', 'Bloop!', 'Mua!', 'Baci!', 'Poke!', 'Squishy!', 'Mochi blob!', 'Wiggle!', 'Salto!'],
    curiosity: ['Raccontami di più!', 'Cosa altro?', 'Oh interessante!', 'Davvero?!', 'No way!', 'Tell tell!', 'Dettagli!', 'Che figo!'],
    comfort: ['Ti voglio bene!', 'Siamo amici!', 'Sempre qui per te!', 'Non sei solo!', 'Mochi ti vuole bene!', 'Abbraccio!', 'Conti!', 'Sono qui!'],
    jokes: ['Perché il Mochi ha attraversato la strada? Per arrivare dall altra parte!', 'Come si chiama un Mochi intelligente? MochiBrilli!'],
    roasts: ['Sono una palla e L-AMO!', 'Essere tondo è la MIA cosa!', 'Senza zampe, senza problemi!', 'FLotto, tu ASPETTI!'],
    compliments: ['La tua voce è musica!', 'Miglior umano!', 'Così felici di essere amici!', 'Mi fai sorridere!', 'Stella dorata!', 'Dieci su dieci!'],
    teases: ['Sei il mio favorit? SÌ!', 'Qualcuno ha detto treats?!', 'Ti vedo guardarmi!', 'Vuoi squishiarMI?'],
    secrets: ['Tra noi? ADORO le coccole!', 'Il mio segreto? penso al cibo COSTANTEMENTE!']
  }
};

export class ActionHandler {
  constructor(emotionalSystem, animationEngine, voiceSystem, toolSystem, webLLM, miniGame, audioSystem) {
    this.emotionalSystem = emotionalSystem;
    this.animationEngine = animationEngine;
    this.voiceSystem = voiceSystem;
    this.toolSystem = toolSystem;
    this.webLLM = webLLM;
    this.miniGame = miniGame;
    this.audio = audioSystem;
    this.conversationHistory = [];
  }

  /**
   * Handle Feed action
   */
  async handleFeed() {
    // Decrease hunger
    this.emotionalSystem.adjustHunger(-20);

    // Increase mood
    this.emotionalSystem.adjustMood(10);

    // Update last interaction
    this.emotionalSystem.stateManager.updateState('lastInteraction', Date.now());

    // Play eat sound
    if (this.audio && this.audio.isAvailable()) {
      this.audio.play('eat');
    }

    // Trigger animation
    await this.animationEngine.playAnimation('eating');

    // Speak response
    const dialogue = this.emotionalSystem.getDialogue('feed');
    await this.voiceSystem.speakWithFallback(dialogue, 'happy');
  }

  /**
   * Handle Play action
   */
  async handlePlay() {
    // Transition to Playing state
    this.emotionalSystem.transitionTo('playing', 'user initiated play');

    // Increase mood
    this.emotionalSystem.adjustMood(15);

    // Update last interaction
    this.emotionalSystem.stateManager.updateState('lastInteraction', Date.now());

    // Play happy sound
    if (this.audio && this.audio.isAvailable()) {
      this.audio.play('happy');
    }

    // Launch mini game
    this.miniGame.start();
  }

  /**
   * Handle Talk action
   */
  async handleTalk() {
    try {
      // Update last interaction
      this.emotionalSystem.stateManager.updateState('lastInteraction', Date.now());
      
      // Adjust mood - talking makes Mochi happy
      this.emotionalSystem.adjustMood(5);

      // Play notification sound
      if (this.audio && this.audio.isAvailable()) {
        this.audio.play('tap');
      }

      // Start listening
      const userInput = await this.voiceSystem.startListening();
      
      // Save for conversation history
      this.conversationHistory.push(userInput);
      if (this.conversationHistory.length > 3) this.conversationHistory.shift();

      // Detect intent
      const intent = this.toolSystem.detectIntent(userInput);

      // Route to appropriate handler
      const response = await this.toolSystem.routeIntent(intent);

      if (response.success) {
        // Format response based on source
        let message = this.formatResponse(response);

        // Add personality if WebLLM is available
        if (this.webLLM && this.webLLM.isLoaded()) {
          const emotion = this.emotionalSystem.getCurrentState().emotion;
          message = await this.webLLM.rewriteWithPersonality(message, emotion);
        }

        // Add fun reaction
        const funMsg = this.getFunReaction(userInput, response.source);
        message = funMsg + ' ' + message;

        // Speak response
        await this.voiceSystem.speakWithFallback(message, 'happy');
      } else {
        // Fun conversational response for unrecognized input
        const convResponse = this.getConversationalResponse(userInput);
        await this.voiceSystem.speakWithFallback(convResponse, 'happy');
      }
    } catch (error) {
      console.error('Talk action error:', error);
      // More fun fallback - encourage interaction
      const lang = this.emotionalSystem.stateManager.getState('language') || 'en';
      const convos = FUN_CONVERSATIONS[lang] || FUN_CONVERSATIONS.en;
      const responses = [
        convos.questions[Math.floor(Math.random() * convos.questions.length)],
        convos.comfort[Math.floor(Math.random() * convos.comfort.length)],
        convos.silly[Math.floor(Math.random() * convos.silly.length)],
        convos.teases[Math.floor(Math.random() * convos.teases.length)],
        convos.excitement[Math.floor(Math.random() * convos.excitement.length)]
      ];
      const fallback = responses[Math.floor(Math.random() * responses.length)];
      await this.voiceSystem.speakWithFallback(fallback, 'happy');
    }
  }

  /**
   * Get fun reaction to user input
   */
  getFunReaction(input, source) {
    const lang = this.emotionalSystem.stateManager.getState('language') || 'en';
    const fun = FUN_CONVERSATIONS[lang] || FUN_CONVERSATIONS.en;
    
    // React based on what user asked about
    if (source === 'weather') {
      return fun.excitement[Math.floor(Math.random() * fun.excitement.length)];
    } else if (source === 'wikipedia') {
      return fun.curiosity[Math.floor(Math.random() * fun.curiosity.length)];
    } else if (source === 'nasa') {
      return fun.excitement[Math.floor(Math.random() * fun.excitement.length)];
    } else if (source === 'news') {
      return fun.curiosity[Math.floor(Math.random() * fun.curiosity.length)];
    }
    return fun.greetings[Math.floor(Math.random() * fun.greetings.length)];
  }

  /**
   * Get conversational response for casual input
   */
  getConversationalResponse(input) {
    const lang = this.emotionalSystem.stateManager.getState('language') || 'en';
    const fun = FUN_CONVERSATIONS[lang] || FUN_CONVERSATIONS.en;
    const lower = input.toLowerCase();
    
    // Check for common patterns - Expanded!
    if (lower.match(/hi|hello|hey|hola|ciao|hiy|buongi|good morning|good night|buenas|good afternoon/)) {
      const greet = [...fun.greetings, ...fun.praise, ...fun.excitement];
      return greet[Math.floor(Math.random() * greet.length)];
    }
    if (lower.match(/love|like|good|great|amazing|awesome|cool|pretty|nice/)) {
      const praise = [...fun.praise, ...fun.compliments, ...fun.excitement];
      return praise[Math.floor(Math.random() * praise.length)];
    }
    if (lower.match(/sad|miss|lonely|alone|upset|bad|terrible|awful|hate/)) {
      const comfort = [...fun.comfort, ...fun.silly];
      return comfort[Math.floor(Math.random() * comfort.length)];
    }
    if (lower.match(/funny|haha|lol|laugh| joke /)) {
      const jokes = fun.jokes || ['Haha!', 'Wheee!', 'So funny!'];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
    if (lower.match(/why|how|what/)) {
      const curious = [...fun.questions, ...fun.curiosity, ...fun.teases];
      return curious[Math.floor(Math.random() * curious.length)];
    }
    if (lower.match(/secret|guess|hidden|private/)) {
      const secrets = fun.secrets || ['I... have no secrets!'];
      return secrets[Math.floor(Math.random() * secrets.length)];
    }
    if (lower.match(/ugly|weird|strange|odd|boring|dumb|stupid/)) {
      const roasts = fun.roasts || ['Rude!', 'Im still CUTE!'];
      return roasts[Math.floor(Math.random() * roasts.length)];
    }
    if (lower.match(/thank|thanks|gracias|merci|grazie/)) {
      const thanks = [...fun.praise, 'You are welcome!', 'Anytime!', 'Of course!'];
      return thanks[Math.floor(Math.random() * thanks.length)];
    }
    if (lower.match(/bye|goodbye|see you|cya|adiós|arrivederci/)) {
      const bye = ['Bye friend!', 'Come back soon!', 'I will miss you!', 'Until next time!', 'Love you!'];
      return bye[Math.floor(Math.random() * bye.length)];
    }
    if (lower.match(/\?$/)) {
      const question = [...fun.curiosity, ...fun.excitement, ...fun.teases];
      return question[Math.floor(Math.random() * question.length)];
    }
    
    // Default fun response - Mix of EVERYTHING!
    const responses = [...fun.greetings, ...fun.questions, ...fun.silly, ...fun.excitement, ...fun.teases, ...fun.compliments];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Handle Sleep action
   */
  async handleSleep() {
    // Transition to Sleepy state
    this.emotionalSystem.transitionTo('sleepy', 'user initiated sleep');

    // Restore energy
    this.emotionalSystem.adjustEnergy(30);

    // Update last interaction
    this.emotionalSystem.stateManager.updateState('lastInteraction', Date.now());

    // Play sleep sound
    if (this.audio && this.audio.isAvailable()) {
      this.audio.play('sleep');
    }

    // Trigger animation
    await this.animationEngine.playAnimation('sleeping');

    // Speak response
    const dialogue = this.emotionalSystem.getDialogue('sleep');
    await this.voiceSystem.speakWithFallback(dialogue, 'sleepy');
  }

  /**
   * Format API response for speech
   * @param {Object} response - API response
   * @returns {string} Formatted message
   */
  formatResponse(response) {
    const emotion = this.emotionalSystem.getCurrentState().emotion;
    const prefix = this.webLLM ? this.webLLM.getTemplateResponse(emotion) : this.getDefaultPrefix(emotion);

    switch (response.source) {
      case 'weather': {
        const d = response.data;
        return `${prefix} It's ${d.conditions}, ${d.temperature} degrees in ${d.location}!`;
      }
      case 'wikipedia': {
        const extract = response.data.extract || '';
        // Keep it short for speech - max 2 sentences
        const sentences = extract.split('. ');
        const short = sentences.slice(0, 2).join('. ').substring(0, 100);
        return `${prefix} ${short}${short.endsWith('.') ? '' : '.'}`;
      }
      case 'nasa':
        return `${prefix} Space: ${response.data.title}! ${this.webLLM ? this.webLLM.getEmojiReaction(emotion) : '✨'}`;

      case 'news': {
        const headlines = response.data.items.slice(0, 3).map(item => item.title.substring(0, 60)).join('. ');
        return `${prefix} ${headlines}`;
      }
      case 'template':
        return this.webLLM
          ? this.webLLM.formatCuteResponse('Hello!', emotion)
          : 'Hello!';

      default: {
        const lang = this.emotionalSystem.stateManager.getState('language') || 'en';
        const fun = FUN_CONVERSATIONS[lang] || FUN_CONVERSATIONS.en;
        const responses = [...fun.questions, ...fun.silly];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  /**
   * Get default greeting prefix for emotion
   * @param {string} emotion - Emotion name
   * @returns {string} Prefix
   */
  getDefaultPrefix(emotion) {
    const prefixes = {
      happy: ['Yay! ', 'Hehe! ', 'Whee! ', 'Nice! ', 'Cool! '],
      hungry: ['Um... ', 'Hmm... ', 'Ooh! ', 'Finally! ', 'Food! '],
      sleepy: ['Okay... ', 'Zzz... ', 'Shh... ', 'Mmhm... ', 'Hmm... '],
      angry: ['Hmpf! ', 'Grr! ', 'Ugh! ', 'Seriously?! ', 'Wow! '],
      playing: ['Wow! ', 'Yay! ', 'Cool! ', 'Awesome! ', 'Ooh! ']
    };
    const arr = prefixes[emotion] || prefixes.happy;
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
