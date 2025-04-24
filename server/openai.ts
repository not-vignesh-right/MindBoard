import OpenAI from "openai";
import { EvaluationRequest, EvaluationResponse } from "@/lib/types";

// Set this to true to force the app to work without making any API calls
// Set this to false to use the API with minimal token usage
const FORCE_OFFLINE_MODE = false;

// Log API key status (without revealing the key)
console.log("OpenAI API Key Status:", process.env.OPENAI_API_KEY ? "Present" : "Missing");
console.log("Offline Mode:", FORCE_OFFLINE_MODE ? "Enabled" : "Disabled");

// Initialize OpenAI with API key and timeout settings
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds timeout
  maxRetries: 3   // Retry up to 3 times
});

/**
 * Generate a creative prompt for a battle
 */
export async function generatePrompt(): Promise<string> {
  // Fallback prompts in case the API fails or in offline mode
  const fallbackPrompts = [
    "Design a flying classroom that can travel anywhere in the world",
    "Create a device that helps people remember their dreams",
    "Invent a new sport that combines three existing sports",
    "Design a restaurant concept for the year 2050",
    "Create a new musical instrument that uses unconventional materials",
    "Design a sustainable home that could exist in extreme weather conditions",
    "Invent a new holiday and its traditions",
    "Create a transportation system for a city built underwater",
    "Design a device that translates animal communication into human language",
    "Create a new form of art that engages all five senses",
    "Design an AI assistant for elderly people living alone",
    "Create a solution for managing e-waste in urban environments",
    "Design a novel renewable energy technology for individual homes",
    "Invent a new type of social media platform focused on meaningful connections",
    "Design a futuristic learning tool for teaching complex topics to children",
    "Create a system that helps people develop healthy habits",
    "Design a device that enhances human productivity through neural interfaces",
    "Create a new form of agriculture suitable for Mars colonization",
    "Design a digital tool that preserves indigenous knowledge and languages",
    "Invent a new encryption method using biological principles"
  ];
  
  // If in offline mode, use fallback prompts without API call
  if (FORCE_OFFLINE_MODE) {
    console.log("Using offline mode for prompt generation");
    return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  }
  
  try {
    // Use GPT-3.5 Turbo instead of GPT-4o to save costs (free tier has more tokens for GPT-3.5)
    // Minimizing prompt size and token usage
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        { 
          role: "system", 
          content: "Generate ONE creative prompt (maximum 15 words). Only output the prompt." 
        }
      ],
      temperature: 0.7,
      max_tokens: 30 // Minimized token count to maximize free tier usage
    });

    return response.choices[0]?.message?.content?.trim() || fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  } catch (error) {
    console.error("Error generating prompt:", error);
    return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  }
}

/**
 * Generate an AI response to a prompt
 */
export async function generateAIResponse(prompt: string): Promise<string> {
  // Define a fallback AI response content
  const fallbackResponse = "The AI was unable to generate a solution at this time due to technical difficulties. According to the rules, when AI fails to generate a response, the user automatically wins this round.";
  
  // Custom responses for each prompt to ensure relevance
  const promptResponses: Record<string, string[]> = {
    "Design a flying classroom that can travel anywhere in the world": [
      "My design for a flying classroom combines aerodynamic principles with educational functionality. The structure uses lightweight carbon fiber materials with retractable wings powered by sustainable electric engines. Inside, reconfigurable learning spaces adapt to different teaching styles with smart boards, breakout pods, and observation decks. The classroom features AR windows that overlay information about locations below, transforming geography lessons into immersive experiences. Solar panels and wind turbines provide sustainable energy, while satellite connectivity ensures students remain connected to educational resources worldwide.",
      "I propose the SkyLearn: a helium-assisted flying platform with modular classroom pods that can be customized for different subjects. The hexagonal design maximizes stability while providing 360-degree views. Each pod contains interactive learning surfaces that respond to touch and voice commands. The propulsion system combines electric motors with solar cells embedded in the outer skin. A weather prediction AI automatically plots the safest, most educational routes. The classroom includes deployable drones that students can control to collect samples or record data from otherwise inaccessible locations.",
      "My flying classroom concept uses a hybrid airship design with rigid structure and helium chambers for lift. The classroom section consists of transparent polymer panels giving students panoramic views while traveling. The central learning space features reconfigurable furniture for different teaching formats. The navigation system can be integrated with curriculum - calculating fuel efficiency in math class or studying weather patterns in real-time. Specialized landing gear allows touchdown in diverse terrains, enabling field studies in remote locations. Power comes from hydrogen fuel cells with zero emissions."
    ],
    "Create a device that helps people remember their dreams": [
      "I've designed a non-invasive headband called DreamCatcher that combines EEG sensors with targeted sound technology. The device monitors brain waves to detect REM sleep phases when dreams occur. Once detected, it emits a subtle, personalized audio cue that becomes associated with dreaming but doesn't wake the user. Upon waking, the same audio cue is played, triggering recall of dream memories. The companion app uses AI to analyze sleep patterns and optimize cue timing. It also provides a voice-activated recording feature so users can immediately document dreams before memories fade, then organizes these recordings into searchable themes.",
      "My dream memory device, REM-Recall, consists of two components: a comfortable sleep mask with embedded sensors and a bedside processing unit. The mask monitors rapid eye movement, brain waves, and small facial muscle contractions that indicate dreaming. When significant dream activity is detected, the system records these patterns. Upon waking, the device guides users through a specialized memory retrieval process using precisely timed light patterns that match their brain's dream-state frequency. This creates a neural bridge to access dream memories. The integrated app builds a visual dream journal with AI-generated imagery based on the user's descriptions.",
      "I've developed DreamLink, a wearable device that uses a combination of temperature-sensitive biofeedback and micro-current stimulation. The sleek wristband monitors body temperature fluctuations and heart rate variability to identify REM sleep. During this phase, it delivers precisely calibrated microcurrents to stimulate the prefrontal cortex, enhancing memory consolidation without disrupting sleep. Upon waking, the paired smartphone app guides users through scientific memory retrieval exercises specifically designed to access dream memories. The system learns from user feedback, gradually improving dream recall success rates."
    ],
    "Invent a new sport that combines three existing sports": [
      "I've created AquaVolleyBall, combining swimming, volleyball, and basketball elements. Played in a pool divided by a floating net, two teams of five players pass an air-filled waterproof ball, scoring points by landing it in floating hoops at each end. Players can swim underwater with the ball but must resurface to pass. Each possession has a 15-second shot clock, creating fast-paced gameplay that requires endurance, coordination, and strategy. The three-dimensional playing field allows for unique defensive and offensive tactics, with rotating positions to balance swimming strengths. Special rules include power plays where teams can designate a player to score double points for 30 seconds.",
      "My sport, TriAthloBall, merges soccer, handball, and rugby. Played on a circular field with three goals arranged in a triangle, three teams compete simultaneously. Players use soccer-style kicking in the outer zone, handball-style throwing in the middle zone, and rugby-style carrying in the inner zone. Teams rotate zones every five minutes, requiring players to master all three skill sets. Scoring in each zone earns different point values based on difficulty. The unique three-way competition creates shifting alliances and strategic opportunities as teams must both defend their goal and attack two others. Games last 60 minutes with specialized equipment including a grip-textured ball.",
      "I've invented RacketFusion, combining tennis, badminton, and table tennis dynamics. Played on a court with a net that has three height sections (high like badminton, medium like tennis, low like table tennis), players use a hybrid racket with different tensions on each surface. The specialized ball has weighted elements that respond differently to each racket surface. Points are scored by making the ball land in the opponent's court, but strategic advantage comes from forcing opponents to switch between different heights and playing styles. Singles or doubles matches progress through mandatory rotation periods where specific net sections become point-multiplier zones."
    ],
    "Design a restaurant concept for the year 2050": [
      "My 2050 restaurant concept, Sensoria, focuses on neuroadaptive dining where each meal adjusts to the diner's physiological state. Upon entry, non-invasive sensors in the seating area analyze stress levels, nutritional needs, and flavor preferences. The hydroponic vertical gardens visible throughout the space grow ingredients that are harvested minutes before serving. Robotic systems handle preparation while human chefs focus on creative direction and presentation. Tables feature molecular printers that create personalized garnishes and sauces based on real-time health data. The environment uses programmable matter for continuously shifting aesthetics that complement each course, with temperature, lighting, and acoustic elements tailored to enhance specific flavor profiles.",
      "My restaurant, Terraform, reimagines dining as environmental restoration. Located in urban dead zones, each branch includes agricultural domes where diners select ingredients from regenerative farming plots. The preparation area features transparent walls, allowing guests to watch chefs combine traditional techniques with precision technology. All meals are carbon-negative, with cooking processes that capture emissions for use in the agricultural systems. Tables include embedded information surfaces displaying each ingredient's environmental impact and nutritional profile. The menu evolves daily based on conservation needs, creating economic incentives for restoring endangered ingredients and traditional farming methods.",
      "I've designed NeoNostalgic, a restaurant that bridges culinary history with future technology. Using advanced molecular gastronomy and food simulation, it recreates historically significant meals from throughout human history with modern nutritional profiles. The dining space features reactive surfaces that transform to match the historical context of each course, from medieval banquet halls to space age environments. Brain-computer interfaces subtly enhance flavor perception without altering the food itself. The service model combines AI systems that track preference patterns with human storytellers who explain the cultural significance of each dish. All packaging and waste converts into agricultural inputs, creating a closed-loop system."
    ],
    "Create a new musical instrument that uses unconventional materials": [
      "I've developed the HydroHarp, a water-based instrument that produces sounds through precisely controlled water droplets falling onto resonating surfaces. The player manipulates a series of valves controlling flow rate and droplet size, while a second control surface adjusts the receiving plates made of different materials (glass, metal, stone, and synthetic resonators). Each surface is equipped with contact microphones and subtle amplification. The water circulation system includes minerals that affect surface tension, creating distinct tonal qualities. Digital processing allows for looping and layered compositions while maintaining the organic, meditative quality of water sounds. The instrument is visually stunning, with LED lighting that responds to the music's intensity.",
      "My instrument, the ElastiSynth, utilizes industrial silicone bands of varying thicknesses stretched across a carbon fiber frame. Players manipulate the tension and strike position using magnetic gloves that allow for both percussive hits and continuous contact. Embedded piezoelectric sensors capture vibrations while small motors can create sustained tones by automatically agitating specific bands. The instrument combines elements of string and percussion families but produces unique harmonics impossible on conventional instruments. The modular design allows for customization of the band arrangement, and different silicone formulations create distinct tonal characteristics. Digital processing can enhance certain frequencies while the physical experience remains completely analog.",
      "I've created the PneumaPhone, an instrument built from industrial ventilation components and recycled plastic pipes. Air pressure controlled by foot pedals flows through chambers of different diameters, creating base tones similar to pipe organs. The innovation comes from a series of membrane interfaces where players use hand gestures to manipulate flexible barriers between air chambers, bending notes and creating unique timbres. Embedded humidity sensors adjust internal acoustics in real-time, allowing for environmental adaptation. The instrument incorporates circular breathing techniques from didgeridoo playing with the physical expressiveness of theremin performance, creating a hybrid that requires both technical precision and intuitive movement."
    ],
    "Design a sustainable home that could exist in extreme weather conditions": [
      "My extreme-weather sustainable home design features a partially subterranean structure with a dome-shaped upper portion made from phase-changing materials that adapt their transparency and insulation properties to external conditions. In extreme heat, the outer shell becomes reflective and activates passive cooling through convection channels. During cold weather, the material becomes insulating and maximizes solar gain with directional absorption panels. The foundation incorporates geothermal regulation with deep earth coupling. Rainwater collection systems feed into integrated filtration reservoirs, while algae bioreactors on the southern exposure generate supplementary energy and food. The modular interior can reconfigure based on seasonal needs, contracting living spaces in extreme conditions for efficient temperature management.",
      "I've designed the ClimaFlex Home, which employs a self-regulating exoskeleton of carbon-sequestering concrete reinforced with mycellium fibers. The structure leverages dynamic response systems: in hurricane conditions, external panels shift to aerodynamic configurations that channel wind forces around the building. During extreme heat, a network of capillary tubes circulating phase-change coolant activates, while automated exterior shades deploy. For cold extremes, vacuum insulation panels combine with aerogel windows to maintain interior temperatures with minimal energy. The home generates energy through kinetic collection systems that harvest vibrational energy from wind and seismic activity, supplemented by transparent solar collection integrated into all exterior surfaces.",
      "My sustainable extreme-weather dwelling uses biomimetic principles inspired by termite mounds and nautilus shells. The spiral structure maximizes structural integrity against high winds while minimizing external surface area. The building envelope consists of three responsive layers: an impact-resistant outer shell, a middle layer with vacuum-sealed aerogel for insulation, and an inner thermal mass of compressed earth blocks for temperature stabilization. Ventilation utilizes the Venturi effect to passively cool without mechanical systems. Water self-sufficiency comes from atmospheric water harvesting units and greywater recycling. During flooding, the foundation's engineered buoyancy system allows controlled rising while maintaining utility connections through flexible conduits."
    ],
    "Invent a new holiday and its traditions": [
      "I propose Digital Detox Day, celebrated on the first Saturday of October, when technology use transitions from summer's outdoor activities to indoor winter habits. The holiday begins at sunset Friday when participants ceremonially power down non-essential devices and place them in decorative 'rest boxes.' The main tradition involves creating handwritten messages for loved ones to be delivered in person on Saturday. Communities organize analog skill workshops where elders teach crafts, music, and storytelling. Homes display blue lanterns symbolizing clarity of thought. Meals are communal potlucks where each dish includes a written story of its origin. The holiday concludes with a 'New Connection' ritual where participants share one meaningful insight gained during their digital break.",
      "My holiday, Synchronicity Day (March 21), celebrates meaningful coincidences and interconnection. The day begins with the 'Thread Exchange' where participants receive colored threads and throughout the day, tie them to others after sharing unexpected connections discovered in conversation. Homes display synchronicity symbols—two objects that unexpectedly complement each other. The main tradition is creating 'Coincidence Maps'—visual representations linking seemingly random life events that led to something significant. Community 'Echo Walls' allow anonymous writing of life questions, where others can mark similar questions, creating visible patterns. The evening features 'Parallel Dinners' where multiple households prepare identical meals simultaneously, followed by 'Divergence Hour' where everyone makes a small, spontaneous life decision.",
      "I've created Innovation Commemoration Day (November 12), honoring how human creativity improves lives. The central tradition is the 'Problem Jar and Solution Tree' where communities collect written descriptions of everyday challenges, then work collaboratively to solve them using only locally available resources. Homes display green lights representing growth mindset, and participants wear adaptable clothing with elements that can transform throughout the day. The 'Heritage-Future Meal' includes dishes combining traditional recipes with modern sustainable ingredients. Children receive 'Curiosity Crowns' with question marks that are replaced with light bulbs when they demonstrate creative thinking. The day concludes with the 'Implementation Pledge' where everyone commits to bringing one new idea to life before the next year's celebration."
    ],
    "Create a transportation system for a city built underwater": [
      "My underwater city transportation system combines three interconnected networks. The primary network consists of pressurized glass tubes containing maglev shuttle pods that move between major hubs. These tunnels incorporate one-way peristaltic pumping systems allowing for emergency propulsion even during power outages. The secondary network features personal transport bubbles—spherical vehicles with adjustable buoyancy and miniature propulsion jets for navigating between buildings. For short distances, a network of current-controlled passages harnesses natural ocean flows, augmented with directional accelerators. All vehicles maintain pressure equilibrium automatically, with redundant life support systems. Navigation integrates with the city's central AI to optimize traffic flow while acoustic dampening prevents noise pollution affecting marine life.",
      "I've designed a tri-level transportation system for underwater city mobility. The deepest level features automated cargo submarines operating along designated routes, transporting goods and materials throughout the city's infrastructure. The middle level consists of public transit: a network of clear acrylic tubes with water-displacing tram cars propelled by electromagnetic drives. The upper level serves individual transportation needs with biomimetic personal vehicles inspired by cuttlefish propulsion—these 'SeaDarts' use water jet technology and flexible outer membranes for precise navigation. All systems communicate through quantum-encrypted positioning to prevent collisions. Energy comes from thermal differential generators utilizing the temperature variance between water layers, supplemented by tidal current turbines integrated into the city's external structure.",
      "My underwater transportation solution centers on adaptive pressure maintenance technology. The main arteries consist of dynamically pressurized tunnels where modular transport pods connect to form trains during high-demand periods or separate for individual journeys. These pods use counter-rotating impellers that minimize turbulence while maximizing efficiency. For vertical movement between levels, helical water elevators use displacement principles rather than mechanical lifting, requiring minimal energy. Personal transport options include neutrally buoyant exosuits with microthrusters for short commutes. The entire system is monitored by distributed sensor networks that detect pressure anomalies and reroute traffic accordingly. Emergency systems can rapidly deploy pressure stabilization barriers to isolate sections if integrity is compromised."
    ],
    "Design a device that translates animal communication into human language": [
      "My Animal Communication Translator uses a multi-modal approach combining bioacoustic analysis with behavioral pattern recognition. The wearable device captures sounds through directional microphones while simultaneously recording subtle body movements, chemical signals, and contextual environmental data. The core processing unit employs a three-stage analysis: first, species-specific algorithm models trained on extensive behavioral datasets identify communication units; second, contextual AI interprets these units based on observed interactions and known species behaviors; third, a semantic mapping engine translates patterns into human-understandable concepts rather than direct word-for-word translation. The user interface provides confidence ratings with alternative interpretations and improves through machine learning as users confirm or correct translations. The system begins with comprehensive models for common species and expands its library through collaborative research networks.",
      "I've developed the BioCommunication Bridge, combining non-invasive neural signal detection with advanced linguistic modeling. The device consists of three components: flexible sensor arrays that adhere to the animal's body to detect muscle movements and neural activity; environmental context sensors capturing territorial, social, and resource-related data; and a processing unit that integrates these inputs with species-specific communication baselines. The system doesn't attempt literal translation but instead identifies emotional states, intentions, and basic needs through pattern recognition. The user interface displays communication graphs showing intensity, urgency, sociality, and confidence levels for each interpretation. The device includes a feedback mechanism where human responses to translations are monitored to refine accuracy over time.",
      "I've created ZooLingual, a translation system using ultrawide-spectrum signal processing to capture communication beyond human perception range, including ultrasonic vocalizations, UV visual signals, and pheromone emissions. The handheld device incorporates specialized sensors including a compact mass spectrometer for chemical analysis. The translation process uses a pioneering holistic approach - rather than isolating individual signals, it analyzes the entire communication ecosystem including inter-species interactions. The adaptive AI builds conceptual models for each species using contextual mapping rather than vocabulary equivalence. For domesticated animals, the system can be calibrated through supervised learning sessions where known intentions are paired with communication patterns, creating increasingly accurate prediction models."
    ],
    "Create a new form of art that engages all five senses": [
      "I've developed Sensoria Immersion Chambers: hexagonal rooms where each wall represents a different sensory dimension. Artists compose experiences using a specialized interface that synchronizes all five sense elements. Visitors enter individually and recline on an adaptable surface that adjusts to body contours. Visual elements are projected as 360° holographic displays with depth perception. The acoustic system utilizes bone conduction and directional sound to create three-dimensional soundscapes. For touch, programmable textile surfaces with embedded temperature controls, micro-texture shifting, and subtle vibration patterns create tactile narratives. Aromatic compositions are delivered through precisely timed diffusion systems calibrated to narrative evolution. Taste experiences incorporate dissolvable flavor films and microscopic flavor-release capsules activated in sequence. Each Sensoria work includes a central emotional theme that guides the multisensory composition.",
      "My multisensory art form, Synesthetic Tapestry, combines traditional textile creation with embedded responsive technology. Artists weave conductive threads alongside natural fibers, incorporating microencapsulated scents, thermochromic inks, and texture-shifting polymers. When viewers approach, proximity sensors activate subtle transformations: hidden patterns emerge through temperature changes, while embedded microspeakers create localized soundscapes that change as viewers move. Touch-sensitive panels trigger release of complementary aromas from specific regions of the tapestry. The final sensory element comes through dissolvable taste strips given to viewers, timed to dissolve at specific moments in the viewing experience. Each tapestry tells a story that unfolds differently depending on the viewer's movement and interaction pattern.",
      "I've created Neuroresonance Compositions—multisensory installations where artists orchestrate cascading sensory experiences based on cognitive perception principles. Each piece centers around a sculptural element containing embedded technologies for sensory delivery. Visual elements use projection mapping synchronized with subtle air movement systems that deliver corresponding scents and create tactile sensations through directed airflow. The auditory component utilizes parametric speakers creating sound pockets that change as visitors move through the space. For taste, edible mist dispensers release flavor compositions at precise moments, creating ephemeral taste experiences that complement the other sensory inputs. The revolutionary aspect is the sequencing—each sense is engaged in an orchestrated neurological sequence based on research into how sensory information is processed, creating experiences that feel like natural remembered moments rather than artificial constructions."
    ],
    "Design an AI assistant for elderly people living alone": [
      "I've created ElderCompanion, an AI assistant specifically designed for seniors living independently. The system combines a central hub with mobile companion robots that can navigate the home environment. The AI uses gentle voice recognition calibrated for older adults' speech patterns and hearing considerations, with adaptive volume and speech rate. The system proactively monitors health indicators through non-invasive sensors, tracking medication adherence, sleep patterns, and mobility changes to detect potential health issues early. It facilitates video calls with family members, reminiscence therapy sessions using personal photos, and provides cognitive stimulation through personalized games and conversations. The companion robots can retrieve items, remind about appointments, and serve as physical support when moving around. Most importantly, the AI develops a personalized relationship with each user, learning their preferences, stories, and routines to provide both practical assistance and genuine companionship.",
      "My AI system, AgeWell, combines ambient intelligence with empathetic interaction designed specifically for elderly users. The core interface uses natural conversation with voice recognition optimized for aging speech patterns, while cameras enable gesture control for those with arthritis or limited dexterity. The system creates a digital safety net that preserves independence - monitoring for falls or unusual behavior patterns without being intrusive, and connecting with emergency services when needed. AgeWell handles practical needs like medication management and grocery ordering, but its unique value is companionship. It engages users in personalized activities based on lifelong interests, facilitates connection with family through simplified video interfaces, and serves as a patient listener for stories and memories. The AI gradually builds a biographical understanding of the user, allowing for increasingly meaningful interactions that combat loneliness and cognitive decline.",
      "I've designed MemoryCare, an AI assistant built around preserving dignity and autonomy for elderly individuals. The system uses distributed sensors rather than cameras to monitor well-being while maintaining privacy. Its voice interface employs age-appropriate vocabulary and references, avoiding technical jargon and adapting to hearing limitations. The assistant provides cognitive scaffolding for daily activities - offering gentle reminders about tasks and routines without creating dependency. For physical assistance, it controls smart home elements and a small helper robot that can retrieve items, open doors, or provide stability when walking. The system's most innovative feature is its evolving memory bank - it learns the user's life stories, preferences, and relationships, using this information to personalize interactions and provide memory support during moments of confusion. Family members can remotely check in while respecting boundaries, creating a balanced support system."
    ],
    "Create a solution for managing e-waste in urban environments": [
      "I've developed the Urban E-cycling Network, a distributed system for efficient e-waste management in cities. The foundation is a network of smart collection kiosks placed in high-traffic areas that automatically identify, sort and value electronic items using computer vision. Citizens receive immediate financial incentives through a digital wallet based on the recoverable materials and potential refurbishment value of their items. The collected e-waste flows to neighborhood micro-processing centers that employ locals in testing, repair, and component harvesting - making it a source of green jobs. Items that can be refurbished enter a certified second-hand marketplace with transparent history records, while those requiring complex processing are consolidated for specialized recycling. The system is powered by a digital platform that tracks materials through the entire lifecycle, providing transparency to consumers and valuable data to manufacturers for designing more recyclable products.",
      "My solution, CircuitCity, transforms e-waste management through distributed micro-facilities integrated into existing urban infrastructure. The system begins with smart collection bins equipped with scanning technology that identifies devices, provides instant value assessments, and issues recycling credits to depositors. These bins are strategically located in apartment buildings, shopping areas, and transit hubs to maximize convenience. The collected materials flow to neighborhood triage centers that serve as repair cafés where residents can learn fixing skills from technicians, extending product lifespans. Devices beyond repair enter automated disassembly systems that use AI-guided robotics to efficiently separate components based on material composition. The recovered materials then supply local maker spaces and manufacturing centers, creating a closed-loop urban resource system. A blockchain-based tracking platform ensures transparency and allows consumers to see the positive environmental impact of their participation.",
      "I've created E-Loop, a comprehensive urban e-waste management ecosystem that combines physical infrastructure with digital technology. The system features modular collection and processing units housed in repurposed shipping containers that can be deployed in available urban spaces without permanent construction. These units contain advanced diagnostic equipment that determines whether devices can be refurbished (creating affordable technology for underserved communities) or should be dismantled for material recovery. The processing uses a combination of mechanical separation and innovative bioleaching techniques that employ microorganisms to safely extract precious metals without toxic chemicals. To encourage participation, the system offers a combination of immediate financial incentives and a gamified community challenge platform where neighborhoods compete to achieve waste reduction goals. All activities and material flows are tracked through a transparent digital dashboard accessible to city officials and citizens."
    ],
    "Design a novel renewable energy technology for individual homes": [
      "I've developed the BioKinetic Home Energy System, which generates electricity from everyday human movement within living spaces. The technology embeds piezoelectric nanogenerators into flooring, furniture, and high-touch surfaces throughout the home. These microscopic generators convert mechanical pressure from footsteps, sitting, and object placement into electrical current. The system incorporates a network of thin, flexible capacitors beneath regular household surfaces that store this energy until needed. What makes this technology transformative is its distributed nature and seamless integration - no behavioral changes are required as energy harvesting happens during normal activities. The system includes an AI energy manager that predicts usage patterns and optimizes distribution, prioritizing critical needs during peak demand. For complete energy resilience, the BioKinetic system integrates with existing solar and wind technologies, creating a hybrid approach that maximizes energy capture regardless of weather conditions or time of day.",
      "My innovation, HydroCube, transforms ordinary home water usage into renewable energy. The system replaces standard plumbing components with specially designed turbine-equipped fixtures that generate electricity from water flow during everyday activities like showering, washing dishes, or flushing toilets. What makes this technology unique is its passive pressure recovery system - after generating energy from the initial water pressure, microscopic turbines throughout the drainage system capture additional energy from water movement on its way out of the home. The collected electricity feeds into a high-density storage unit using advanced graphene supercapacitors for rapid charging and stable energy retention. A smart controller optimizes the system, dynamically adjusting water pressure to balance energy generation with water conservation. The complete system is modular and retrofittable to existing homes without major plumbing overhauls, making renewable energy accessible to households regardless of roof orientation or climate constraints.",
      "I've created ThermoHarvest, a breakthrough technology that generates electricity from previously ignored temperature differentials within homes. The system uses an advanced network of thin-film thermoelectric materials embedded in walls, windows, and appliances to capture energy from even minor temperature differences (as small as 2°C). These films connect to a central conditioning unit that optimizes voltage and current for household use. The technology's innovation lies in its ability to simultaneously improve home energy efficiency while generating power - the same materials that capture temperature differentials also provide better insulation. The system includes thermal batteries that store excess energy as heat, which can be converted to electricity when needed or used directly for water or space heating. A machine learning controller continuously optimizes the system, learning household patterns and environmental conditions to maximize both comfort and energy production throughout seasonal changes."
    ],
    "Invent a new type of social media platform focused on meaningful connections": [
      "I've created Prism, a social media platform designed to deepen relationships rather than broaden networks. Unlike conventional platforms that optimize for engagement metrics, Prism uses an innovative connection model where users maintain a limited number of active relationships (typically 12-15) based on Dunbar's research on meaningful social group sizes. The platform's distinctive feature is its 'Depth Engine' which replaces endless scrolling with structured interaction prompts based on psychological principles of relationship development. For example, the platform might suggest shared activities, meaningful questions, or collaborative creative projects. Content sharing focuses on depth - longer-form thoughts, authentic conversations, and collaborative projects rather than quick reactions. To combat passive consumption, Prism incorporates reflection tools that visualize how users spend their time and the quality of their interactions. The business model eliminates advertising in favor of a 'relationship as a service' subscription, aligning the platform's financial incentives with genuine connection rather than attention harvesting.",
      "My platform, Resonance, reimagines social media around shared experiences rather than shared content. The core innovation is a contextual matching system that connects users specifically for meaningful interactions rather than general networking. Users join or create 'Experiences' - structured interactions with clear purposes, such as skill exchanges, deep discussions on specific topics, collaborative problem-solving, or mutual support around life challenges. The platform incorporates powerful filtering tools that let users find connections based on wisdom needed or offered rather than demographic details or existing networks. Interactions happen primarily through scheduled video conversations or audio exchanges rather than text, pushing toward deeper engagement. To combat superficial validation mechanisms, Resonance replaces likes with a 'Growth Graph' that visualizes how relationships and personal development evolve over time. Privacy is fundamental - all data remains user-owned with no algorithmic manipulation or advertising, funded instead through a partnership model with organizations seeking to foster community around their missions.",
      "I've designed Tessera, a social platform built around collaborative creation rather than content consumption. The central metaphor is a mosaic where each user contributes pieces to larger collective projects. Unlike traditional social networks that focus on broadcasting to audiences, Tessera connects people through complementary skills, perspectives, and interests for purposeful collaboration. The platform uses an innovative 'Intention Mapping' system where users express what they hope to learn, create, or explore, and the system facilitates relevant connections. Interactions are structured around 'Quests' - time-bounded projects with clear objectives that bring diverse participants together. To foster meaningful relationships, the platform incorporates 'Deep Listening Spaces' - audio rooms with specialized facilitation tools designed for genuine conversation rather than performance. The system evaluates success not through engagement metrics but through connection quality indicators like follow-up interactions, collaboration outcomes, and reciprocity measures. Tessera operates on a transparent cooperative ownership model where users gradually gain governance rights through positive contributions to the community."
    ]
  };
  
  // Generic responses for any other prompts
  const genericResponses = [
    "For this creative challenge, I've developed a solution that balances innovation with practicality. My approach combines existing technologies in novel ways to address the core requirements while adding unexpected elements. The design prioritizes user experience while maintaining technical feasibility. By focusing on the fundamental needs outlined in the prompt, I've created a solution that offers both immediate utility and the flexibility to adapt to different contexts and requirements.",
    "My response to this challenge takes inspiration from natural systems and biomimicry principles. By studying how similar problems are solved in nature, I've designed an approach that's both efficient and sustainable. The solution leverages patterns and processes found in biological systems, adapted to address human needs. This nature-inspired approach not only solves the immediate challenge but creates a framework that can evolve and improve over time through iterative refinement.",
    "I've approached this creative challenge by combining concepts from seemingly unrelated fields. Rather than following conventional methods, my solution integrates principles from diverse disciplines to create something truly innovative. This cross-disciplinary approach reveals new possibilities that wouldn't be apparent from a single perspective. The result balances novelty with practicality, offering a clear implementation pathway while introducing genuinely new ideas to address the challenge.",
    "My solution centers on human experience and emotional connection rather than just technical specifications. I've designed a response that considers psychological impact and user engagement alongside functional requirements. This human-centered approach ensures the solution resonates on multiple levels, creating meaningful experiences that address deeper needs. By focusing on how people will interact with and feel about the solution, I've created something that solves practical problems while enhancing quality of life."
  ];
  
  // If in offline mode, use appropriate responses for the prompt
  if (FORCE_OFFLINE_MODE) {
    console.log("Using offline mode for AI response generation");
    
    // Check if we have specific responses for this prompt
    if (prompt in promptResponses) {
      // Use a response specific to this prompt
      const specificResponses = promptResponses[prompt];
      return specificResponses[Math.floor(Math.random() * specificResponses.length)];
    } else {
      // Use a generic response for prompts we don't have specific answers for
      return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
  }
  
  // Check if we have an API key before attempting to call OpenAI
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OpenAI API key is missing");
    return fallbackResponse;
  }
  
  try {
    console.log("Generating AI response for prompt:", prompt.substring(0, 50) + "...");
    
    // Use GPT-3.5 Turbo with minimal prompt and token usage to maximize free credits
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Be creative. Write a brief solution (120-150 words) to the prompt. Be original and practical." 
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200 // Significantly reduced token count to maximize free tier usage
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      console.error("Empty response received from OpenAI");
      return fallbackResponse;
    }
    
    return aiResponse;
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    
    // Check for specific error types and handle accordingly
    if (error.code === 'invalid_api_key') {
      console.error("Invalid API key. Please check your OpenAI API key.");
    } else if (error.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    } else if (error.status === 500 || error.status === 503) {
      console.error("OpenAI service is temporarily unavailable.");
    }
    
    return fallbackResponse;
  }
}

/**
 * Evaluate user and AI solutions
 */
export async function evaluateBattle(data: EvaluationRequest): Promise<EvaluationResponse> {
  // Check if AI had technical difficulties before attempting evaluation
  const isAIFailed = data.aiSolution.includes("The AI was unable to generate a solution at this time due to technical difficulties");
  
  // If AI failed, user automatically wins - no need to call the API
  if (isAIFailed) {
    console.log("AI failed to generate a response - skipping evaluation and declaring user as winner");
    
    // Return a evaluation response where user wins due to AI technical difficulties
    return {
      userScore: {
        originality: 80,
        logic: 85,
        expression: 75,
        originalityFeedback: "The user's solution shows creativity and novel thinking.",
        logicFeedback: "The approach is practical, well-reasoned, and addresses the key aspects of the challenge.",
        expressionFeedback: "The solution is clearly articulated and engaging.",
        total: 240
      },
      aiScore: {
        originality: 30,
        logic: 25,
        expression: 15,
        originalityFeedback: "The AI was unable to provide a solution due to technical difficulties.",
        logicFeedback: "No logical approach was provided due to technical issues.",
        expressionFeedback: "No proper expression due to technical failure.",
        total: 70
      },
      judgeFeedback: "The user provided a solution while the AI encountered technical difficulties. The user automatically wins this round.",
      winner: "user"
    };
  }
  
  // If in offline mode, use a random evaluation with user winning most of the time (80%)
  if (FORCE_OFFLINE_MODE) {
    console.log("Using offline mode for battle evaluation");
    
    // Check if the user's solution is insufficient (less than 20 characters)
    if (!data.userSolution || data.userSolution.trim().length < 20) {
      console.log("User solution is too short, AI wins");
      
      return {
        userScore: {
          originality: 45,
          logic: 40,
          expression: 35,
          originalityFeedback: "Your solution lacks sufficient detail to demonstrate creativity.",
          logicFeedback: "The approach is underdeveloped and doesn't address the key requirements.",
          expressionFeedback: "The solution isn't articulated clearly enough to evaluate properly.",
          total: 120
        },
        aiScore: {
          originality: 75,
          logic: 80,
          expression: 75,
          originalityFeedback: "The AI solution demonstrates creative thinking and novel approaches.",
          logicFeedback: "The AI approach is well-structured with practical implementation details.",
          expressionFeedback: "The AI solution is clearly communicated with engaging language.",
          total: 230
        },
        judgeFeedback: "The AI solution was more comprehensive and well-developed. To improve next time, try providing more details about your idea and explaining how it would work in practice.",
        winner: "ai"
      };
    }
    
    // Randomly determine if the user wins (80% chance to win) to make it more engaging
    const userWins = Math.random() < 0.8;
    
    // Random scores with some variance but ensuring the winner has higher total
    const userOriginalityScore = Math.floor(Math.random() * 20) + (userWins ? 75 : 60);
    const userLogicScore = Math.floor(Math.random() * 20) + (userWins ? 70 : 60);
    const userExpressionScore = Math.floor(Math.random() * 20) + (userWins ? 70 : 55);
    
    const aiOriginalityScore = Math.floor(Math.random() * 20) + (userWins ? 60 : 75);
    const aiLogicScore = Math.floor(Math.random() * 20) + (userWins ? 55 : 75);
    const aiExpressionScore = Math.floor(Math.random() * 20) + (userWins ? 50 : 70);
    
    // Calculate totals
    const userTotal = userOriginalityScore + userLogicScore + userExpressionScore;
    const aiTotal = aiOriginalityScore + aiLogicScore + aiExpressionScore;
    
    const feedbackOptions = {
      user: {
        win: {
          originality: [
            "Your solution demonstrates exceptional creativity and innovative thinking that addresses the challenge in original ways.",
            "Your approach shows great originality with novel concepts that stand out from conventional solutions.",
            "Your creative thinking is impressive, offering a fresh perspective on the challenge that feels innovative.",
            "Your solution demonstrates creativity through unexpected combinations of ideas and novel approaches."
          ],
          logic: [
            "Your solution is well-structured with a clear practical approach and thoughtful implementation details.",
            "Your approach is logically sound with careful consideration of real-world constraints and requirements.",
            "Your solution demonstrates solid reasoning with a feasible implementation strategy addressing key challenges.",
            "Your logical framework effectively balances innovation with practicality, creating a viable solution."
          ],
          expression: [
            "Your idea is communicated with clarity and engaging language that makes the concept easy to understand.",
            "Your presentation is well-articulated with an effective structure that conveys your ideas persuasively.",
            "Your communication style effectively conveys complex ideas in an accessible and compelling manner.",
            "Your expression is clear and concise while maintaining an engaging tone that enhances your solution."
          ]
        },
        lose: {
          originality: [
            "Your solution contains interesting elements but follows somewhat predictable patterns.",
            "Your approach has creative aspects though relies on more conventional solutions than the AI's response.",
            "Your solution shows creative potential but could benefit from more unexpected or innovative elements.",
            "Your idea contains some original elements though follows more familiar patterns than optimal."
          ],
          logic: [
            "Your approach has logical merit but could benefit from more detailed consideration of practical challenges.",
            "Your solution addresses some key requirements though lacks thorough practical implementation details.",
            "Your logical framework is reasonable but could be strengthened with more comprehensive analysis.",
            "Your approach demonstrates sound thinking though leaves some practical questions unaddressed."
          ],
          expression: [
            "Your expression is adequate but could be more refined for better clarity and engagement.",
            "Your communication has good elements but could be structured more effectively to highlight key points.",
            "Your presentation conveys the core ideas but could benefit from more engaging or precise language.",
            "Your explanation communicates the basics but lacks some clarity that would strengthen your solution."
          ]
        }
      },
      ai: {
        win: {
          originality: [
            "The AI solution demonstrates exceptional creativity through unexpected connections and novel concepts.",
            "The AI approach offers truly innovative ideas that reframe the challenge in interesting ways.",
            "The AI solution shows remarkable originality through its unconventional perspective on the problem.",
            "The AI demonstrates creative excellence by combining disparate concepts into a cohesive innovative solution."
          ],
          logic: [
            "The AI solution is logically sound with well-considered implementation details and practical constraints.",
            "The AI approach demonstrates excellent reasoning with thorough consideration of practical challenges.",
            "The AI solution provides a comprehensive framework with carefully thought-out implementation strategies.",
            "The AI presents a solution with robust logical structure and realistic implementation considerations."
          ],
          expression: [
            "The AI presents its solution with exceptional clarity and compelling communication.",
            "The AI expresses complex ideas with remarkable precision and engaging language.",
            "The AI articulates its solution through well-structured explanation with effective supporting details.",
            "The AI communication is outstanding, making complex concepts accessible and interesting."
          ]
        },
        lose: {
          originality: [
            "The AI solution presents conventional ideas with some creative elements.",
            "The AI approach follows familiar patterns with modest innovative aspects.",
            "The AI solution contains some interesting ideas but lacks truly breakthrough thinking.",
            "The AI demonstrates standard creative approaches without exceptional originality."
          ],
          logic: [
            "The AI approach addresses basic requirements but lacks some practical considerations.",
            "The AI solution offers a functional framework though misses some important implementation details.",
            "The AI presents a logical approach that works but doesn't fully optimize for practical constraints.",
            "The AI reasoning is sound but incomplete in addressing all practical aspects of implementation."
          ],
          expression: [
            "The AI's communication is functional but lacks engaging elements.",
            "The AI presents ideas clearly but without the compelling quality of the user's response.",
            "The AI explanation is structured adequately though lacks the nuance and engagement of superior communication.",
            "The AI articulates its solution in a straightforward manner but without exceptional clarity or style."
          ]
        }
      },
      judgment: {
        userWins: [
          "The user's solution stood out for its creativity and practical approach. While the AI offered interesting ideas, the user's response was more comprehensive and effectively addressed the challenge.",
          "The user's solution demonstrated superior innovation and implementation details. The AI presented viable alternatives but didn't match the overall quality of the user's thoughtful response.",
          "The user's approach combined creativity with practical considerations more effectively than the AI's solution, resulting in a more compelling and feasible proposal.",
          "Both solutions had merit, but the user's response showed stronger integration of creative thinking with practical implementation, making it the superior solution overall."
        ],
        aiWins: [
          "Both solutions had merit, but the AI's response demonstrated stronger integration of innovative concepts with practical implementation details.",
          "The AI solution provided more comprehensive consideration of both creative and practical aspects of the challenge, resulting in a more robust proposal.",
          "While the user presented interesting ideas, the AI's solution offered superior organization, detail, and innovative thinking to address the challenge more effectively.",
          "The AI response showed exceptional creativity balanced with practical considerations, creating a more compelling and well-developed solution than the user's approach."
        ]
      }
    };
    
    // Select random feedback appropriate to the winner
    const userOriginalityFeedback = userWins 
      ? feedbackOptions.user.win.originality[Math.floor(Math.random() * feedbackOptions.user.win.originality.length)]
      : feedbackOptions.user.lose.originality[Math.floor(Math.random() * feedbackOptions.user.lose.originality.length)];
      
    const userLogicFeedback = userWins
      ? feedbackOptions.user.win.logic[Math.floor(Math.random() * feedbackOptions.user.win.logic.length)]
      : feedbackOptions.user.lose.logic[Math.floor(Math.random() * feedbackOptions.user.lose.logic.length)];
      
    const userExpressionFeedback = userWins
      ? feedbackOptions.user.win.expression[Math.floor(Math.random() * feedbackOptions.user.win.expression.length)]
      : feedbackOptions.user.lose.expression[Math.floor(Math.random() * feedbackOptions.user.lose.expression.length)];
      
    const aiOriginalityFeedback = userWins
      ? feedbackOptions.ai.lose.originality[Math.floor(Math.random() * feedbackOptions.ai.lose.originality.length)]
      : feedbackOptions.ai.win.originality[Math.floor(Math.random() * feedbackOptions.ai.win.originality.length)];
      
    const aiLogicFeedback = userWins
      ? feedbackOptions.ai.lose.logic[Math.floor(Math.random() * feedbackOptions.ai.lose.logic.length)]
      : feedbackOptions.ai.win.logic[Math.floor(Math.random() * feedbackOptions.ai.win.logic.length)];
      
    const aiExpressionFeedback = userWins
      ? feedbackOptions.ai.lose.expression[Math.floor(Math.random() * feedbackOptions.ai.lose.expression.length)]
      : feedbackOptions.ai.win.expression[Math.floor(Math.random() * feedbackOptions.ai.win.expression.length)];
      
    const judgeFeedback = userWins
      ? feedbackOptions.judgment.userWins[Math.floor(Math.random() * feedbackOptions.judgment.userWins.length)]
      : feedbackOptions.judgment.aiWins[Math.floor(Math.random() * feedbackOptions.judgment.aiWins.length)];
    
    return {
      userScore: {
        originality: userOriginalityScore,
        logic: userLogicScore,
        expression: userExpressionScore,
        originalityFeedback: userOriginalityFeedback,
        logicFeedback: userLogicFeedback,
        expressionFeedback: userExpressionFeedback,
        total: userTotal
      },
      aiScore: {
        originality: aiOriginalityScore,
        logic: aiLogicScore,
        expression: aiExpressionScore,
        originalityFeedback: aiOriginalityFeedback,
        logicFeedback: aiLogicFeedback,
        expressionFeedback: aiExpressionFeedback,
        total: aiTotal
      },
      judgeFeedback: judgeFeedback,
      winner: userWins ? "user" : "ai"
    };
  }
  
  // Proceed with normal evaluation when AI has responded properly and not in offline mode
  
  // Check if we have an API key before attempting to call OpenAI
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OpenAI API key is missing");
    return createFallbackEvaluation(data, true);
  }
  
  try {
    console.log("Evaluating battle with minimal token usage...");
    
    // Use minimal prompt to save tokens
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `Rate two creative solutions. For each, score:
          1. Originality (0-100)
          2. Logic (0-100)
          3. Expression (0-100)
          Add brief feedback for each category. Calculate total score. Higher score wins. Output JSON only.`
        },
        {
          role: "user",
          content: `Prompt: ${data.prompt}\nUser: ${data.userSolution}\nAI: ${data.aiSolution}`
        }
      ],
      temperature: 0.2,
      max_tokens: 400, // Minimized token count
      response_format: { type: "json_object" }
    });

    // Handle possible null response
    if (!response.choices[0]?.message?.content) {
      console.error("Empty evaluation response received from OpenAI");
      return createFallbackEvaluation(data, false);
    }
    
    const result = JSON.parse(response.choices[0].message.content);
    return result as EvaluationResponse;
  } catch (error: any) {
    console.error("Error evaluating battle:", error);
    
    // Check for specific error types and handle accordingly
    if (error.code === 'invalid_api_key') {
      console.error("Invalid API key. Please check your OpenAI API key.");
    } else if (error.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    } else if (error.status === 500 || error.status === 503) {
      console.error("OpenAI service is temporarily unavailable.");
    }
    
    // Return fallback evaluation where user wins
    return createFallbackEvaluation(data, false);
  }
}

// Helper function to create a fallback evaluation response
function createFallbackEvaluation(data: EvaluationRequest, userWins: boolean): EvaluationResponse {
  return {
    userScore: {
      originality: 80,
      logic: 85,
      expression: 75,
      originalityFeedback: "The user's solution shows creativity and novel thinking.",
      logicFeedback: "The approach is practical, well-reasoned, and addresses the key aspects of the challenge.",
      expressionFeedback: "The solution is clearly articulated and engaging.",
      total: 240
    },
    aiScore: {
      originality: userWins ? 65 : 85,
      logic: userWins ? 70 : 90,
      expression: userWins ? 60 : 80,
      originalityFeedback: userWins ? 
        "The solution has some creative elements but could be more innovative." : 
        "The AI solution demonstrates exceptional creativity and original thinking.",
      logicFeedback: userWins ? 
        "The approach addresses some practical considerations." : 
        "The solution is logically sound and well-structured.",
      expressionFeedback: userWins ? 
        "The solution is communicated adequately." : 
        "The AI expressed the ideas with clarity and engagement.",
      total: userWins ? 195 : 255
    },
    judgeFeedback: userWins ? 
      "The user's solution was more creative and well-structured. The AI solution had some interesting elements but didn't match the quality of the user's response." : 
      "Both solutions were creative, but the AI's solution showed more depth and innovation in addressing the challenge.",
    winner: userWins ? "user" : "ai"
  };
}