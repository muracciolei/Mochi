# Requirements Document

## Introduction

Mochi is an AI Virtual Pet + Lightweight Assistant Progressive Web App designed to run on low-end devices. The system provides an emotional, living virtual pet experience with voice interaction, daily routine mechanics, and lightweight AI assistance through deterministic APIs and optional in-browser LLM personality enhancement. The application must be production-quality, fully offline-capable (except external APIs), and optimized for minimal resource consumption.

## Glossary

- **Mochi**: The virtual pet character (round blob creature)
- **Emotional_System**: The subsystem managing Mochi's emotional states and mood
- **Daily_Routine_System**: The subsystem tracking expected user interactions throughout the day
- **Voice_System**: The subsystem handling speech recognition and synthesis
- **Tool_System**: The deterministic API layer providing factual information
- **WebLLM_Module**: The optional in-browser language model for personality enhancement
- **State_Manager**: The subsystem managing persistent application state via LocalStorage
- **PWA_Shell**: The Progressive Web App infrastructure (manifest, service worker, caching)
- **Animation_Engine**: The subsystem rendering SVG-based animations
- **RSS_Parser**: The subsystem fetching and parsing RSS news feeds
- **Alarm_System**: The subsystem managing user-configured daily alarms
- **Reminder_System**: The subsystem managing user-configured reminders
- **Color_System**: The subsystem managing theme and color presets
- **Mini_Game**: The simple touch-optimized game module
- **I18n_Module**: The internationalization subsystem supporting multiple languages
- **Audio_System**: The subsystem playing sound effects and notifications

## Requirements

### Requirement 1: Virtual Pet Visual Rendering

**User Story:** As a user, I want to see Mochi as an animated blob creature, so that I feel emotional connection to my virtual pet

#### Acceptance Criteria

1. THE Animation_Engine SHALL render Mochi as a round blob with two eyes, a simple mouth, and optional blush using SVG
2. WHEN the device does not support SVG, THE Animation_Engine SHALL fall back to Canvas rendering
3. THE Animation_Engine SHALL apply Game Boy-inspired minimal visual style
4. WHEN Mochi's emotional state changes, THE Animation_Engine SHALL update facial expression within 100ms
5. THE Animation_Engine SHALL render smooth animations at 30fps minimum on low-end devices

### Requirement 2: Color Theme System

**User Story:** As a user, I want to customize Mochi's appearance, so that I can personalize my pet

#### Acceptance Criteria

1. THE Color_System SHALL provide Light Mode (White Mochi) and Dark Mode (Black Mochi) themes
2. THE Color_System SHALL provide 12 color presets: White, Black, Pink, Blue, Green, Yellow, Purple, Orange, Cyan, Peach, Lime, Lavender
3. WHEN a user selects a color preset, THE Color_System SHALL apply the change instantly
4. WHEN a color change occurs, THE State_Manager SHALL persist the selection to LocalStorage
5. WHEN the application loads, THE Color_System SHALL restore the user's last selected color from LocalStorage

### Requirement 3: Emotional State Management

**User Story:** As a user, I want Mochi to express emotions, so that the pet feels alive and reactive

#### Acceptance Criteria

1. THE Emotional_System SHALL support 5 emotional states: Happy, Hungry, Sleepy, Angry, Playing
2. WHEN Mochi transitions to a new emotional state, THE Emotional_System SHALL trigger the corresponding facial expression
3. WHEN Mochi transitions to a new emotional state, THE Emotional_System SHALL trigger the corresponding animation
4. WHEN Mochi transitions to a new emotional state, THE Emotional_System SHALL update dialogue responses to match the emotion
5. THE State_Manager SHALL persist the current emotional state to LocalStorage

### Requirement 4: Daily Routine Tracking

**User Story:** As a user, I want Mochi to expect daily interactions, so that I develop a routine with my pet

#### Acceptance Criteria

1. THE Daily_Routine_System SHALL track 4 expected interactions: Morning Breakfast, Midday Lunch, Afternoon Return Home, Evening Dinner
2. WHEN a user completes an expected interaction, THE Emotional_System SHALL increase Mochi's mood
3. WHEN a user ignores an expected interaction, THE Emotional_System SHALL decrease Mochi's mood
4. THE State_Manager SHALL persist interaction timestamps to LocalStorage
5. WHEN the application loads, THE Daily_Routine_System SHALL evaluate missed interactions and adjust mood accordingly

### Requirement 5: User Interaction Actions

**User Story:** As a user, I want to interact with Mochi through simple actions, so that I can care for my pet

#### Acceptance Criteria

1. THE Mochi SHALL support Feed action that decreases hunger and increases mood
2. THE Mochi SHALL support Play action that triggers Playing state and increases mood
3. THE Mochi SHALL support Talk action that activates Voice_System
4. THE Mochi SHALL support Sleep action that triggers Sleepy state and restores energy
5. WHEN any interaction occurs, THE State_Manager SHALL update last interaction timestamp in LocalStorage
6. WHEN any interaction occurs, THE Animation_Engine SHALL trigger the corresponding animation

### Requirement 6: Mini Game System

**User Story:** As a user, I want to play a simple game with Mochi, so that I can have fun interactions

#### Acceptance Criteria

1. THE Mini_Game SHALL complete within 10 to 30 seconds
2. THE Mini_Game SHALL be optimized for touch input
3. THE Mini_Game SHALL support one of: Tap Mochi, Catch Falling Food, or Reaction Tap mechanics
4. WHEN the Mini_Game completes, THE Emotional_System SHALL increase Mochi's mood
5. THE Mini_Game SHALL run at 30fps minimum on low-end devices

### Requirement 7: Voice Recognition and Synthesis

**User Story:** As a user, I want to talk to Mochi using voice, so that I can interact naturally

#### Acceptance Criteria

1. THE Voice_System SHALL use the Web Speech API SpeechRecognition for voice input
2. THE Voice_System SHALL use the Web Speech API SpeechSynthesis for voice output
3. WHEN a user speaks, THE Voice_System SHALL capture the audio and convert to text
4. WHEN Mochi responds, THE Voice_System SHALL synthesize speech from text
5. THE Voice_System SHALL generate responses with 1 to 6 words for typical playful phrases
6. WHEN the Web Speech API is unavailable, THE Voice_System SHALL display text-only responses

### Requirement 8: Multilingual Support

**User Story:** As a user, I want Mochi to speak my language, so that I can understand my pet

#### Acceptance Criteria

1. THE I18n_Module SHALL support English, Spanish, and Italian languages
2. WHEN the application loads, THE I18n_Module SHALL detect language using navigator.language
3. WHEN navigator.language is "en", THE I18n_Module SHALL use English
4. WHEN navigator.language is "es", THE I18n_Module SHALL use Spanish
5. WHEN navigator.language is "it", THE I18n_Module SHALL use Italian
6. WHEN navigator.language is none of the above, THE I18n_Module SHALL default to English
7. THE I18n_Module SHALL localize UI text, Mochi dialogue, system messages, notifications, alarm messages, reminder messages, and API response formatting

### Requirement 9: Weather Information Tool

**User Story:** As a user, I want Mochi to tell me the weather, so that I can plan my day

#### Acceptance Criteria

1. THE Tool_System SHALL integrate with OpenWeatherMap API for weather data
2. WHEN a user requests weather information, THE Tool_System SHALL fetch current weather conditions
3. WHEN weather data is received, THE Tool_System SHALL format the response according to the current language
4. WHEN the API request fails, THE Tool_System SHALL return a localized error message
5. THE Tool_System SHALL detect weather-related intent from user voice input

### Requirement 10: Wikipedia Information Tool

**User Story:** As a user, I want Mochi to look up information, so that I can learn about topics

#### Acceptance Criteria

1. THE Tool_System SHALL integrate with Wikipedia REST API for article summaries
2. WHEN a user requests information about a topic, THE Tool_System SHALL fetch the Wikipedia summary
3. WHEN Wikipedia data is received, THE Tool_System SHALL format the response according to the current language
4. WHEN the API request fails, THE Tool_System SHALL return a localized error message
5. THE Tool_System SHALL detect Wikipedia-related intent from user voice input

### Requirement 11: NASA Information Tool

**User Story:** As a user, I want Mochi to share space facts, so that I can learn about astronomy

#### Acceptance Criteria

1. THE Tool_System SHALL integrate with NASA Open APIs for space information
2. WHEN a user requests space information, THE Tool_System SHALL fetch NASA data
3. WHEN NASA data is received, THE Tool_System SHALL format the response according to the current language
4. WHEN the API request fails, THE Tool_System SHALL return a localized error message
5. THE Tool_System SHALL detect NASA-related intent from user voice input

### Requirement 12: News Feed Tool

**User Story:** As a user, I want Mochi to tell me the news, so that I stay informed

#### Acceptance Criteria

1. THE RSS_Parser SHALL fetch news from CNN English, CNN Spanish, and RAI Italian RSS feeds
2. THE RSS_Parser SHALL support custom RSS feed URLs
3. WHEN a user requests news, THE RSS_Parser SHALL fetch headlines and short summaries
4. WHEN RSS data is received, THE Tool_System SHALL format the response according to the current language
5. WHEN the RSS request fails, THE Tool_System SHALL return a localized error message
6. THE Tool_System SHALL detect news-related intent from user voice input

### Requirement 13: WebLLM Personality Enhancement

**User Story:** As a user, I want Mochi to have a cute personality, so that interactions feel more engaging

#### Acceptance Criteria

1. THE WebLLM_Module SHALL use a quantized model in the 1B to 2B parameter range
2. THE WebLLM_Module SHALL be lazy-loaded only when needed
3. THE WebLLM_Module SHALL rewrite Tool_System outputs to add emotional personality
4. THE WebLLM_Module SHALL generate short conversational replies for non-tool interactions
5. THE WebLLM_Module SHALL make responses cute and emotionally expressive
6. WHEN WebLLM_Module is unavailable or slow, THE Mochi SHALL fall back to prewritten response templates
7. THE WebLLM_Module SHALL NOT be used for factual information retrieval

### Requirement 14: Intent Detection and Routing

**User Story:** As a user, I want Mochi to understand what I'm asking for, so that I get relevant responses

#### Acceptance Criteria

1. THE Tool_System SHALL detect user intent from voice or text input
2. WHEN weather intent is detected, THE Tool_System SHALL route to Weather API
3. WHEN Wikipedia intent is detected, THE Tool_System SHALL route to Wikipedia API
4. WHEN NASA intent is detected, THE Tool_System SHALL route to NASA API
5. WHEN news intent is detected, THE Tool_System SHALL route to RSS_Parser
6. WHEN no tool intent is detected, THE Tool_System SHALL route to WebLLM_Module or fallback templates

### Requirement 15: Alarm System

**User Story:** As a user, I want to set a daily alarm, so that Mochi can wake me up

#### Acceptance Criteria

1. THE Alarm_System SHALL allow users to set a daily alarm with custom time
2. WHEN the alarm triggers, THE Alarm_System SHALL activate Mochi to speak
3. WHEN the alarm triggers, THE Voice_System SHALL speak the day of week, current time, and greeting message
4. THE Alarm_System SHALL work offline using local device time
5. THE State_Manager SHALL persist alarm configuration to LocalStorage
6. THE Audio_System SHALL play an alarm sound when the alarm triggers

### Requirement 16: Reminder System

**User Story:** As a user, I want to set reminders, so that Mochi helps me remember tasks

#### Acceptance Criteria

1. THE Reminder_System SHALL allow users to create reminders with text and time
2. THE Reminder_System SHALL support multiple active reminders
3. WHEN a reminder triggers, THE Voice_System SHALL speak the reminder text
4. THE State_Manager SHALL persist all reminders to LocalStorage
5. THE Audio_System SHALL play a notification sound when a reminder triggers
6. WHEN a reminder triggers, THE Reminder_System SHALL remove it from active reminders

### Requirement 17: State Persistence

**User Story:** As a user, I want Mochi to remember everything, so that my progress is never lost

#### Acceptance Criteria

1. THE State_Manager SHALL persist hunger level to LocalStorage
2. THE State_Manager SHALL persist mood level to LocalStorage
3. THE State_Manager SHALL persist energy level to LocalStorage
4. THE State_Manager SHALL persist last interaction timestamp to LocalStorage
5. THE State_Manager SHALL persist all alarms to LocalStorage
6. THE State_Manager SHALL persist all reminders to LocalStorage
7. THE State_Manager SHALL persist language preference to LocalStorage
8. THE State_Manager SHALL persist color preference to LocalStorage
9. THE State_Manager SHALL persist first install timestamp to LocalStorage
10. WHEN the application loads, THE State_Manager SHALL restore all persisted state

### Requirement 18: Progressive Web App Infrastructure

**User Story:** As a user, I want to install Mochi as an app, so that I can access it like a native application

#### Acceptance Criteria

1. THE PWA_Shell SHALL provide a manifest.json file with app metadata
2. THE PWA_Shell SHALL provide a service worker for offline caching
3. THE PWA_Shell SHALL cache all static assets for offline use
4. THE PWA_Shell SHALL provide app icons in multiple sizes
5. THE PWA_Shell SHALL be installable on mobile and desktop devices
6. THE PWA_Shell SHALL function fully offline except for external API calls

### Requirement 19: Audio Feedback System

**User Story:** As a user, I want to hear sounds when Mochi reacts, so that interactions feel more immersive

#### Acceptance Criteria

1. THE Audio_System SHALL provide a happy sound effect
2. THE Audio_System SHALL provide a hungry sound effect
3. THE Audio_System SHALL provide a sleep sound effect
4. THE Audio_System SHALL provide an alarm sound effect
5. THE Audio_System SHALL provide a notification sound effect
6. THE Audio_System SHALL use Web Audio API or HTML5 Audio API
7. THE Audio_System SHALL keep all audio files lightweight for low-end devices

### Requirement 20: Performance Optimization

**User Story:** As a user with a low-end device, I want Mochi to run smoothly, so that I can enjoy the experience

#### Acceptance Criteria

1. THE Mochi SHALL run on low-end Android phones with limited RAM and CPU
2. THE Mochi SHALL use Vanilla JavaScript without heavy frameworks
3. THE Mochi SHALL lazy-load the WebLLM_Module to minimize initial bundle size
4. THE Animation_Engine SHALL optimize animations for 30fps minimum on low-end devices
5. THE Mochi SHALL keep total bundle size minimal through code splitting and optimization

### Requirement 21: Accessibility Support

**User Story:** As a user with accessibility needs, I want to interact with Mochi in multiple ways, so that the app is usable for me

#### Acceptance Criteria

1. THE Mochi SHALL support touch input for all interactions
2. THE Mochi SHALL support voice input for all interactions
3. THE Mochi SHALL support keyboard input as a fallback for all interactions
4. THE Mochi SHALL provide a high contrast mode option
5. THE Mochi SHALL ensure all interactive elements are accessible via keyboard navigation

### Requirement 22: Project Structure Organization

**User Story:** As a developer, I want a clear project structure, so that the codebase is maintainable

#### Acceptance Criteria

1. THE Mochi SHALL organize code in /src directory
2. THE Mochi SHALL separate code into modules: /ui, /state, /animations, /voice, /apis, /rss, /i18n, /llm, /games, /pwa
3. THE Mochi SHALL maintain clear separation of concerns between modules
4. THE Mochi SHALL use consistent naming conventions across all modules

### Requirement 23: Optional Support Link

**User Story:** As a user who enjoys Mochi, I want to support the project, so that development can continue

#### Acceptance Criteria

1. THE Mochi SHALL provide a support link in settings or footer only
2. THE Mochi SHALL display the link as "Support Mochi ☕" pointing to https://buymeacoffee.com/muracciolei
3. THE Mochi SHALL ensure the support link never interrupts user experience
4. THE Mochi SHALL make the support link subtle and non-intrusive

### Requirement 24: One-Time Support Notification

**User Story:** As a user who has used Mochi for 3 days, I want to know about supporting the project, so that I can contribute if I enjoy it

#### Acceptance Criteria

1. THE Mochi SHALL display a support notification only once on the 3rd day of usage
2. THE Mochi SHALL calculate the 3rd day using the first install timestamp from LocalStorage
3. THE Mochi SHALL display the notification as a soft, non-blocking, dismissible toast or modal
4. THE I18n_Module SHALL localize the notification message: "Enjoying Mochi? ☕ Support the project"
5. WHEN the notification is shown, THE State_Manager SHALL persist a flag to LocalStorage to prevent repeat display
6. WHEN the notification is dismissed, THE Mochi SHALL never show it again

### Requirement 25: Configuration Parser and Formatter

**User Story:** As a developer, I want to parse and format configuration data, so that settings are correctly loaded and saved

#### Acceptance Criteria

1. WHEN configuration data is loaded from LocalStorage, THE State_Manager SHALL parse it into a Configuration object
2. WHEN configuration data is invalid, THE State_Manager SHALL return a descriptive error and use default configuration
3. THE State_Manager SHALL format Configuration objects back into valid JSON for LocalStorage
4. FOR ALL valid Configuration objects, parsing then formatting then parsing SHALL produce an equivalent object (round-trip property)
