# FarmVision AI

FarmVision AI is being built as an agricultural intelligence platform in small, reviewable milestones. The primary product and engineering brief remains [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md).

## Current state: prototype code; not ready for production hosting

The repository contains domain modules and prototype components for farms, devices, telemetry, alerts, recommendations, analytics, intelligence, a simulation-only Digital Twin, advisory workflows, and a marketplace foundation. This code presence does not mean every feature is reachable or operational: the active Next.js `frontend/app` currently contains only a placeholder home page and an admin pending-accounts surface. The other documented farmer pages and APIs are not yet wired into the active application.

Production readiness is blocked by missing user-facing routes and end-to-end workflows, unverified PostgreSQL migrations and persistence, missing production SMTP/authentication settings, absent hardware integration and calibration verification, and incomplete production deployment configuration. SMS delivery, MQTT, checkout/payments, actuator commands, and clinical veterinary services are not implemented. Prototype sensor thresholds and recommendations require domain review. Do not describe the platform as production-ready or as providing validated agricultural/veterinary advice.

## Local development setup

Use Node.js 20.9 or newer and the pinned npm package manager.

Create a local environment file from the template and fill in values on your own machine:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Set `DATABASE_URL` to a PostgreSQL database dedicated to FarmVision development, `APP_ALLOWED_ORIGINS` to the exact browser origin used for local sign-in, and `FARMVISION_JWT_SECRET` to a unique random secret. Configure `NEXT_PUBLIC_BASE_URL` and the `SMTP_*` settings with a real mail provider before enabling verification, password-reset, or account-approval email flows. The template contains placeholders only. Do not commit `.env` or paste credentials into source files.

The landing page links to `/login` and `/register`. Registration is Farmer-only, requires email verification and administrator approval, and sends verification mail through the configured SMTP provider. Sign-in is enabled only after both verification and approval. For LAN preview, set `APP_ALLOWED_ORIGINS` and `NEXT_PUBLIC_BASE_URL` to the exact origin in the browser address bar (for example, `http://192.168.99.179:3000`). `allowedDevOrigins` permits that development host for Next.js HMR/font resources; restart `npm run dev` after changing Next.js configuration.

Install dependencies after setting `DATABASE_URL`:

```powershell
npm install
```

The install lifecycle runs `prisma generate`; it generates TypeScript client code and does not connect to PostgreSQL. Prisma CLI settings, including the datasource URL, are defined in `backend/prisma.config.ts`.

Do not apply migrations until the target database and SQL have been reviewed and a backup/rollback plan is in place. Migration application and real PostgreSQL persistence have not been verified in this workspace.

## Checks

```powershell
npm run lint
npm run typecheck
npm test
npm run verify:imports
```

`npm run db:generate` regenerates the Prisma client without a database. `npm run db:migrate` applies pending migrations to the configured database. **Do not run the migration command until the target database and the SQL draft have been reviewed and approved.** The earlier supplied database name was PostgreSQL's default `postgres` database; a dedicated `farmvision_dev` database is recommended before applying application tables.

`npm run verify:imports` checks that every relative import in `backend/src` and `frontend/src` resolves to a file that exists, so the `backend`/`frontend` split cannot silently break module resolution.

Run these checks before deployment. They do not verify database persistence, external email delivery, hardware telemetry, or user flows. Report the actual results from the current environment rather than assuming the checks pass.

## Repository layout

The project is an npm workspace with two packages:

- `backend/` — domain modules (`backend/src/modules/`), server-only code (`backend/src/server/`), the Prisma schema and migrations (`backend/prisma/`), and the Vitest unit suites (`backend/tests/unit/`).
- `frontend/` — the Next.js App Router application (`frontend/src/app/`), React components (`frontend/src/components/`), and shared client helpers (`frontend/src/lib/`).

Cross-project imports use relative paths so both packages type-check and build independently. Backend-only test files may use the `@/*` alias, which resolves to `backend/src/*` through the backend `tsconfig.json` and Vitest configuration.

For local development, use the configured runtime port and do not commit a machine- or session-specific port into project configuration.

## Key files

- [`ARCHITECTURE.md`](./ARCHITECTURE.md): architecture, device/telemetry contract, security design, and current blockers.
- [`TODO.md`](./TODO.md): milestone status and acceptance checklist.
- [`docs/phase3-alerts-automation.md`](./docs/phase3-alerts-automation.md): alert rules, recommendation rules/API, lifecycle, notification/automation limits, and migration boundary.
- [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma): account, role, farm, device, telemetry history, and latest-state schema.
- [`backend/prisma/migrations/20261019224600_phase1_accounts_farms/migration.sql`](./backend/prisma/migrations/20261019224600_phase1_accounts_farms/migration.sql): generated additive SQL draft, not applied.
- [`backend/prisma/migrations/20261020105600_devices_telemetry/migration.sql`](./backend/prisma/migrations/20261020105600_devices_telemetry/migration.sql): incremental device/telemetry SQL draft; apply after Phase 1, not applied.
- [`backend/prisma/migrations/20261020112600_alert_history/migration.sql`](./backend/prisma/migrations/20261020112600_alert_history/migration.sql): additive alert/event SQL draft; apply after Phase 1 and Phase 2, not applied.
- [`backend/prisma/migrations/20261020115000_recommendations/migration.sql`](./backend/prisma/migrations/20261020115000_recommendations/migration.sql): additive recommendation SQL draft; apply after Phase 1, Phase 2, and the alert migration, not applied.


  
FARMVISION AI™ 
Agricultural Intelligence Operating System (AIOS) 
Tagline 
"Transforming Agricultural Data Into Intelligent Decisions, Automated Actions, and Sustainable Productivity." 
Team Member 1 
IRAVUGA Chrismas 
•	RP Musanze College 
•	Advanced Diploma in Electrical Automation Technology 
•	Year 3 
•	Registration No: 24RP02129 
Role: 
•	AI Systems Integration Engineer 
•	IoT Architect 
•	Automation Engineer 
•	Hardware Systems Engineer 
 
Team Member 2 
IRADUKUNDA RUDASINGWA Emmanuel Bienvenu 
•	RP Musanze College 
•	Advanced Diploma in Information Technology 
•	Year 2 
•	Registration No: 25RP16047 
Role: 
•	Full Stack Software Developer 
•	Data Engineer 
•	Cloud Platform Engineer 
 
 
EXECUTIVE SUMMARY 
Agriculture remains the backbone of Rwanda's economy, providing livelihoods for millions of citizens while supporting national food security and economic growth. 
Despite significant progress, many farmers, cooperatives, and agricultural institutions continue to face challenges including: 
•	Low productivity 
•	Resource wastage 
•	Climate-related risks 
•	Livestock and crop losses 
•	Limited access to real-time intelligence 
•	Delayed decision-making 
•	Insufficient integration of agricultural data sources 
At the same time, vast amounts of agricultural data already exist across: 
•	Farm operations 
•	Sensor networks 
•	Weather systems 
•	Climate platforms 
•	Agricultural surveys 
•	Market information systems 
•	Government statistical databases 
However, these datasets often operate independently, limiting their potential value. 
FarmVision AI™ addresses this challenge by introducing a new category of agricultural technology: 
Agricultural Intelligence Operating System (AIOS) 
Unlike conventional agricultural systems that only monitor or report information, FarmVision AI continuously: 
OBSERVE 
    ↓ 
UNDERSTAND 
    ↓ 
PREDICT 
    ↓ 
RECOMMEND 
    ↓ 
AUTOMATE 
    ↓ 
LEARN 
By combining Artificial Intelligence, Big Data, IoT, Computer Vision, Predictive Analytics, Climate Intelligence, and Smart Automation, FarmVision AI transforms agricultural data into actionable intelligence capable of improving productivity, sustainability, and food security. 
 
PROJECT VISION 
Vision 
To become Africa's leading Agricultural Intelligence Operating System, empowering every farmer, cooperative, agribusiness, researcher, and policymaker with intelligent decision-support tools powered by Artificial Intelligence and real-time agricultural insights. 
Mission 
To transform agricultural data into actionable intelligence that increases productivity, strengthens climate resilience, improves sustainability, and enhances food security. 
 
PROBLEM STATEMENT 
The Agricultural Decision Problem 
Every day, agricultural stakeholders make critical decisions: 
•	When to plant 
•	When to irrigate • 	When to harvest 
•	How much feed to provide 
•	How much water is required 
•	Which environmental risks exist 
•	How to maximize productivity 
Most of these decisions are still based on: 
•	Experience 
•	Assumptions 
•	Delayed information 
•	Manual observations The consequences include: 
•	Reduced productivity 
•	Increased operational costs 
•	Wasted resources 
•	Crop losses 
•	Livestock losses 
•	Reduced food security 
 
National Challenge 
Rwanda requires modern agricultural solutions capable of: 
•	Increasing productivity 
•	Improving climate resilience 
•	Enhancing resource efficiency 
•	Supporting evidence-based policies 
•	Strengthening food security 
Current solutions typically address only one problem area: 
•	Weather applications 
•	Irrigation systems 
•	Livestock monitoring systems 
•	Farm management software 
FarmVision AI integrates these capabilities into one intelligent ecosystem. 
  
THE FARMVISION AI ECOSYSTEM 
FarmVision AI is not: 
❌ A dashboard 
❌ A farm management application 
❌ A smart feeder 
❌ An IoT monitoring project FarmVision AI is: 
✅ An Agricultural Intelligence Operating System The platform brings together: 
Farmers 
      + 
Cooperatives 
      + 
Agronomists 
      + 
Researchers 
      + 
Government Institutions 
      + 
IoT Infrastructure 
      + 
Artificial Intelligence 
      + 
Climate Intelligence 
      + 
Automation 
into a unified digital agricultural ecosystem. 
 
PLATFORM ECOSYSTEM 
1. Farmer Intelligence Platform™ 
Provides: 
•	Farm registration 
•	Crop management 
•	Livestock management 
•	AI assistant 
•	Productivity scoring 
•	Environmental monitoring 
•	Production analytics 
•	Automated alerts 
 
2. Cooperative Intelligence Platform™ 
Provides: 
•	Member management • 	Production planning 
•	Resource optimization 
•	Regional analytics 
•	Disease surveillance 
•	Cooperative performance monitoring 
 
3. Government Intelligence Platform™ 
Provides: 
•	Food security monitoring 
•	National production analytics 
•	Climate risk analysis 
•	Agricultural forecasting 
•	District performance comparisons 
•	Policy decision support 
 
4. Research & Innovation Platform™ 
Supports: 
•	Universities 
•	Innovation centers 
•	Researchers 
•	Agricultural institutions through advanced analytical tools and agricultural intelligence services. 
 
5. Agricultural Marketplace™ 
Connects: 
•	Farmers 
•	Buyers 
•	Suppliers 
•	Cooperatives 
•	Agribusinesses for more efficient agricultural commerce. 
 
HARDWARE ECOSYSTEM 
One of the key differentiators of FarmVision AI is its integration of intelligent hardware devices with cloud-based agricultural intelligence. 
 
FarmVision Feeder™ 
Status: 
Operational Working Prototype 
Purpose 
A smart livestock automation unit designed to automate feeding, watering, monitoring, and environmental control. 
Functions 
•	Automated feeding 
•	Automated watering 
•	Feed monitoring 
•	Water monitoring 
•	Environmental monitoring 
•	SMS notifications • 	Livestock automation 
Hardware Components 
•	ESP32 
•	2 × MG90S Servo Motors 
•	HX711 Load Cell System 
•	DHT22 Sensor 
•	DS3231 RTC Module 
•	SIM800L GSM Module 
•	LCD Interface 
•	Relay Control System 
•	Water Pump 
•	Fan Control 
•	Lighting Control 
•	Ultrasonic Sensors 
Demonstrated Capabilities 
Automatic Feeding 
Automatic Watering 
Temperature Monitoring 
Humidity Monitoring 
SMS Alerts 
Actuator Control 
Data Collection 
Smart Automation 
 
FarmVision Node™ 
Status: 
Architecture Complete | Future Hardware Expansion 
Purpose 
Smart farm monitoring node for data acquisition. 
Future Sensor Integration 
•	Soil moisture sensors 
•	Water quality sensors 
•	Environmental sensors 
•	Farm telemetry devices 
Functions 
•	Environmental monitoring 
•	Data collection 
•	IoT communication 
•	Agricultural intelligence generation 
 
FarmVision Climate™ 
Status: 
Digital Prototype 
Functions 
•	Climate tracking 
•	Environmental monitoring 
•	Weather intelligence 
• 	Risk prediction Intelligence Outputs 
•	Drought risk prediction 
•	Heat stress monitoring 
•	Climate impact analysis 
•	Environmental recommendations 
 
FarmVision Vision™ 
Status: 
Prototype Architecture 
Technology 
•	ESP32-CAM 
•	Computer Vision Services 
•	AI-powered Image Analytics 
Functions 
•	Livestock observation 
•	Crop monitoring 
•	Activity tracking 
•	Security monitoring 
•	Risk detection 
 
INTELLIGENCE ENGINE 
FarmVision Intelligence Engine™ 
The core AI engine transforms raw data into decisions. 
 
Yield Prediction Engine 
Predicts: 
•	Future yields 
•	Production risks 
•	Expected harvest performance Inputs: 
•	Historical production 
•	Climate conditions 
•	Farm records 
•	Environmental data 
 
Disease Prediction Engine 
Identifies risks before outbreaks occur. 
Outputs: 
•	Disease probability 
•	Risk scoring 
•	Prevention recommendations 
 
Feed Intelligence Engine 
Predicts: 
•	Feed demand 
•	Future shortages 
•	Consumption trends 
•	Resource planning requirements 
 
Water Intelligence Engine 
Analyzes: 
•	Water demand 
•	Consumption behavior 
•	Water shortages 
•	Irrigation schedules 
 
Climate Intelligence Engine 
Analyzes: 
•	Environmental conditions 
•	Climate threats 
•	Weather impacts 
•	Climate adaptation actions 
 
Farm Scoring Engine 
Generates intelligent farm performance scores based on: 
•	Productivity 
•	Resource efficiency 
•	Sustainability 
•	Operational performance 
 
DIGITAL TWIN TECHNOLOGY 
FarmVision AI creates a digital representation of every farm. 
The Digital Twin simulates: 
•	Feed consumption 
•	Water consumption 
•	Weather changes 
•	Environmental risks 
•	Production performance 
•	Resource shortages 
This enables predictive decision-making before problems occur in the real environment. 
 
DATA ECOSYSTEM 
FarmVision AI integrates five major categories of data. 
Agricultural Statistics 
Including: 
•	Agricultural surveys 
•	Livestock statistics 
•	Food security indicators 
•	Production datasets 
 
Climate Data 
Including: 
•	Rainfall 
•	Temperature 
•	Humidity 
•	Seasonal forecasts 
 
IoT Data 
Collected from: 
•	Sensors 
•	Smart devices 
•	Monitoring systems 
•	Intelligent hardware 
 
Market Intelligence 
Including: 
•	Commodity prices 
•	Supply patterns 
•	Demand trends 
•	Marketplace analytics 
 
Farm Data 
Generated through: 
•	Farmers 
•	Agronomists 
•	Cooperatives 
•	Field operations 
 
TECHNICAL ARCHITECTURE 
USERS 
   │ 
   ▼ 
WEB • MOBILE • SMS • API 
   │ 
   ▼ 
APPLICATION SERVICES 
   │ 
   ▼ 
FARMVISION AI ENGINE 
   │ 
   ▼ 
DATA PLATFORM 
   │ 
   ▼ 
DEVICE ECOSYSTEM 
 
Application Layer 
Includes: 
•	Farm Management 
•	Livestock Management 
•	Crop Intelligence 
•	Marketplace 
•	Government Analytics 
•	Cooperative Services 
•	Reporting Engine 
 
Technology Stack 
Frontend 
•	Next.js 
•	TypeScript 
•	Flutter (in future when we start mobile app for now we will start with web app)
Backend 
•	Node.js with next.js or nestjs
Database 
•	PostgreSQL 
•	Time-Series Storage 
IoT 
•	MQTT 
•	REST APIs • 	ESP32 Platform Artificial Intelligence 
•	Machine Learning 
•	Predictive Analytics 
•	Recommendation Systems 
•	Decision Intelligence Engines 
 
 
BUSINESS MODEL 
Revenue Stream 1 
Software Subscription 
Target customers: 
•	Farmers 
•	Cooperatives 
•	Agribusinesses 
 
Revenue Stream 2 
Government Analytics Services 
•	Forecasting reports 
•	Policy intelligence 
•	Decision-support services 
 
Revenue Stream 3 
Marketplace Commission 
Revenue generated from platform transactions. 
 
Revenue Stream 4 
Hardware Products 
Including: 
•	FarmVision Feeder™ 
•	FarmVision Node™ 
•	FarmVision Climate™ 
•	FarmVision Vision™ 
 
Revenue Stream 5 
Agricultural Intelligence Services 
Advanced: 
•	Forecasting 
•	Analytics 
•	Research intelligence 
•	Data services 
 
EXPECTED IMPACT 
Farmers 
•	Higher productivity 
•	Reduced losses 
•	Lower costs 
•	Improved decision-making 
 
Cooperatives 
•	Better planning 
•	Improved coordination 
•	Resource optimization 
 
Government 
•	Food security intelligence 
•	Agricultural forecasting 
•	Evidence-based policymaking 
 
Rwanda 
•	Increased productivity 
•	Improved food security 
•	Rural economic development 
•	Agricultural digital transformation 
 
COMPETITIVE ADVANTAGE 
Traditional Solutions 
Collect Data 
      ↓ 
Display Data 
FarmVision AI 
Collect Data 
      ↓ 
Analyze Data 
      ↓ 
Predict Future Events 
      ↓ 
Recommend Actions 
      ↓ 
Automate Responses 
      ↓ 
Continuously Learn 
Most agricultural solutions solve a single problem. 
FarmVision AI solves the entire agricultural decision cycle. 
 
CONCLUSION 
FarmVision AI™ is not a farm monitoring application. 
FarmVision AI™ is not an IoT dashboard. 
FarmVision AI™ is not a smart feeder. 
FarmVision AI™ is an Agricultural Intelligence Operating System (AIOS). 
By integrating Artificial Intelligence, Big Data, IoT, Computer Vision, Climate Intelligence, Smart 
Automation, Digital Twin Technology, and Agricultural Analytics into a unified ecosystem, FarmVision AI creates a scalable platform capable of transforming agricultural decision-making in Rwanda and across Africa. 
The current working prototype, FarmVision Feeder™, demonstrates the platform's core automation capabilities through intelligent feeding, watering, environmental monitoring, and real-time farm control. Combined with the broader FarmVision AI ecosystem, this forms the foundation for a nextgeneration agricultural operating system designed to improve productivity, strengthen food security, and drive sustainable agricultural transformation. 
 
Submitted By 
IRAVUGA Chrismas 
RP Musanze College 
Advanced Diploma in Electrical Automation Technology 
IRADUKUNDA RUDASINGWA Emmanuel Bienvenu 
RP Musanze College 
Advanced Diploma in Information Technology 
Competition Track: Agricultural Productivity 
Category: Artificial Intelligence • Big Data • IoT • Computer Vision • Agricultural Intelligence • Smart Automation 
TEAM STRUCTURE 
1. IRAVUGA Chrismas 
Co-Founder & Chief Systems Integration Engineer 
Primary Responsibility: Make the Farm Work 
You own everything that exists physically and everything that connects the physical world to the digital world. 
A. COMPLETE HARDWARE WIRING 
Power Section 
Design: 
Plain Text 
220VAC 
│ 
▼ 
  
12V SMPS 
  
│ 
├── Fan 
├── Pump 
└── Lighting 
  
▼ 
  
5V Buck Converter 
  
│ 
├── ESP32 
├── LCD 
├── RTC 
├── Relay Board 
├── HC-SR04 
└── Servos 
  
ESP32 Connections 
I2C Devices 
Plain Text 
GPIO21 → SDA 
  
GPIO22 → SCL Connected to: 
Plain Text 
LCD 20x4 
  
RTC DS3231 Shared Bus. 
  
HX711 
Plain Text 
HX711 DT → GPIO32 
  
HX711 SCK → GPIO33 Purpose: 
Plain Text 
Feed Weight Measurement 
  
Feed Level Sensor 
Plain Text 
HC-SR04 #1 
  
TRIG → GPIO4 
  
ECHO → GPIO35 Purpose: 
Plain Text 
Feed Tank Monitoring 
  
Water Level Sensor 
Plain Text 
HC-SR04 #2 
  
TRIG → GPIO5 
  
ECHO → GPIO26 Purpose: 
Plain Text 
Water Tank Monitoring 
  
DHT22 
Plain Text 
DATA → GPIO14 Purpose: 
Plain Text 
Temperature 
  
Humidity 
  
Servo Motors 
Feed Gate 
Plain Text 
MG90S #1 
  
Signal → GPIO19 
Feed Dispenser 
Plain Text 
MG90S #2 
  
Signal → GPIO18 
  
Relay Outputs 
Plain Text 
GPIO13 → Fan Relay 
  
GPIO27 → Lamp Relay 
  
GPIO23 → Pump Relay 
  
Buzzer 
Plain Text 
GPIO25 
  
GSM 
Plain Text 
GPIO16 → GSM TX 
  
GPIO17 → GSM RX Purpose: 
Plain Text 
SMS Alerts 
 
Main Areas 
A.	Hardware Architecture Design: 
FarmVision Feeder™ 
FarmVision Node™ 
FarmVision Climate™ 
FarmVision Vision™ Deliverables: 
Electrical Schematics 
Hardware Selection 
Power Architecture 
Sensor Architecture 
Communication Architecture 
  
B.	Embedded Systems 
Build: 
ESP32 Firmware 
Sensor Drivers 
Servo Control 
Relay Control 
RTC Control 
GSM Communication 
Device Logic 
  
C.	Automation Engineering Develop: 
Automatic Feeding 
Automatic Watering 
Climate Monitoring 
Alarm Management 
Actuator Control 
Safety Logic 
  
D.	IoT Integration Implement: 
MQTT Communication 
Device Registration 
Data Transmission 
Cloud Connection 
  
E.	Prototype Construction Responsible for: 
Mechanical Assembly 
Wiring 
Testing 
Calibration 
Troubleshooting 
  
YOUR SUCCESS TESTS 
The judges must physically see: 
Test 1: Automatic Feeding 
Input: 
12:00 PM Feeding Time Expected: 
Servo Opens 
Feed Dispensed 
Weight Recorded 
Servo Closes 
Data Saved 
Pass = Working 
  
Test 2: Feed Low Alert 
Input: Feed Tank <20% Expected: 
LCD Alert 
Dashboard Alert 
SMS Alert 
Pass = Working 
  
Test 3: Water Low 
Input: 
Low Water Level Expected: 
Pump Starts 
Level Restored 
Pump Stops 
Pass = Working 
  
Test 4: High Temperature 
Input: 
Temperature > 30°C Expected: 
Fan ON 
Alert Generated 
Pass = Working 
  
Test 5: Sensor Monitoring 
Expected Display: 
Temperature 
Humidity 
Feed Level 
Water Level 
Weight 
Real-time updates. 
Pass = Working 
  
2. IRADUKUNDA RUDASINGWA Emmanuel Bienvenu 
Co-Founder & Platform Engineering Lead 
Primary Responsibility: Make the Intelligence Work Own everything from dashboard to AI. 
  
A. Farmer Platform 
Develop: 
Farmer Dashboard 
Farm Registration 
Animal Registration 
Crop Management 
Reports 
  
B. Backend Development 
Develop: 
Authentication 
API Services 
Database 
Application Logic 
  
C. Data Engineering 
Implement: 
Data Collection 
Data Processing 
Data Analytics 
Data Warehousing 
  
D. AI Platform 
Build: 
Feed Intelligence 
Water Intelligence 
Yield Prediction 
Disease Prediction 
Climate Intelligence 
  
E. National Intelligence Dashboard 
Build: 
Government Dashboard 
Cooperative Dashboard 
Research Dashboard 
  
F. Marketplace 
Build: 
Buyers 
Suppliers 
Farmer Connections 
  
SOFTWARE SUCCESS TESTS 
Judges must see: 
Test 1: Farm Registration 
Input: Create Farm Expected: 
Farm Saved 
Farmer Linked 
Pass = Working 
  
Test 2: Device Data Reception 
Input: 
ESP32 Sends Data Expected: 
Dashboard Updates 
Database Updates 
Pass = Working 
  
Test 3: AI Recommendation 
Input: 
Temperature = 32°C 
Humidity = 85% Expected: 
Heat Stress Risk 
Recommended Actions 
Pass = Working 
  
Test 4: Yield Prediction 
Input: 
Farm Data 
Climate Data Historical Records Expected: 
Predicted Yield 
Risk Score 
Pass = Working 
  
Test 5: Digital Twin 
Input: 
Feed Reduced Water Reduced 
Expected: 
Virtual Farm Changes 
Risk Prediction Generated 
Pass = Working 
  
WHAT I RECOMMEND YOU FOCUS ON NOW 
Because you have limited funds: 
Chrismas (You) 
Focus 80% on: 
FarmVision Feeder™ 
Automatic Feeding 
Automatic Watering 
Environment Monitoring 
SMS Alerting ESP32 Integration Make it PERFECT. 
A working prototype impresses judges more than ten unfinished devices. 
  
Emmanuel 
Focus 80% on: 
Dashboard 
Backend 
AI Recommendation Engine 
Digital Twin 
Government Dashboard Mockup 
  
DEMO FLOW FOR JUDGES 
Step 1 
Open Dashboard Show: 
Farm Registered 
  
Step 2 
Show Real Hardware 
ESP32 
Sensors 
Servos 
LCD 
  
Step 3 
Press DEMO MODE System shows: 
Feeding Time 
Servo rotates. 
  
Step 4 
Simulate Feed Low Dashboard: Feed Level = 10% Alert appears. 
  
Step 5 
Simulate High Temperature 
Temperature = 35°C Fan activates. 
  
Step 6 
Show AI 
Feed Consumption Trend 
Predicted Feed Shortage 
Recommended Refill Date 
  
FINAL MESSAGE TO JUDGES 
Chrismas demonstrates the physical intelligence layer. 
Observe 
Measure 
Control 
Automate 
Emmanuel demonstrates the digital intelligence layer. 
Analyze 
Predict 
Recommend 
Optimize 
Together, both layers become: 
FARMVISION AI™ 
Agricultural Intelligence Operating System 
Observe 
     ↓ 
Understand 
     ↓ 
Predict 
     ↓ 
Recommend 
     ↓ 
Automate 
     ↓ 
Learn 
That is the strongest story and division of responsibilities for your proposal and presentation. 
TEAM STRUCTURE 
IRAVUGA Chrismas 
Co-Founder 
AI Systems Integration Engineer 
IoT Architect 
Automation Engineer 
Hardware Systems Engineer 
Responsibilities 
•	Hardware architecture 
•	Embedded systems development 
•	IoT integration 
•	Automation design 
•	ESP32 firmware development 
•	Sensor integration 
•	Relay and actuator control 
•	GSM communication 
•	System integration 
•	Prototype deployment 
 
IRADUKUNDA RUDASINGWA Emmanuel Bienvenu 
Co-Founder 
Full Stack Software Developer 
Data Engineer Cloud Platform Engineer 
Responsibilities 
•	Backend systems development 
•	Frontend development 
•	Mobile application development 
•	Cloud architecture 
•	API development 
•	Database systems 
•	Data engineering 
•	Analytics platforms 
•	Dashboard development 
•	Platform integration 
 
