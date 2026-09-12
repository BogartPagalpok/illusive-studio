-- Update portfolio section titles and descriptions to clean, human, straightforward copy
UPDATE portfolio_projects
SET 
  title = 'YOUTUBE SHORTS & TIKTOK EDITS',
  description = 'High-retention short-form content. Built with fast pacing, clean typography, and solid sound design to hook viewers instantly without feeling over-edited.'
WHERE title ILIKE 'DYNAMIC MICRO-NARRATIVE%';

UPDATE portfolio_projects
SET 
  title = 'LIVE EVENTS & SAME-DAY EDITS (SDE)',
  description = 'On-site shooting, directing, and editing. I handle the full pipeline under tight deadlines to deliver polished recap videos before the event even ends.'
WHERE title ILIKE 'END-TO-END EVENT PRODUCTION%';

UPDATE portfolio_projects
SET 
  title = 'LED WALLS & STAGE VISUALS',
  description = 'Custom motion graphics built for massive event screens. Clean, seamless loops designed to elevate the stage without distracting from the live speakers.'
WHERE title ILIKE 'LARGE-FORMAT EVENT VISUALS%' OR title ILIKE 'LARGE FORMAT EVENT VISUALS%';

UPDATE portfolio_projects
SET 
  title = 'PROMOTIONAL POSTERS & KEY VISUALS',
  description = 'Commercial poster design and digital marketing assets. Combining typography, image compositing, and brand identity to make events and products stand out.'
WHERE title ILIKE 'HIGH-IMPACT KEY VISUALS%' OR title ILIKE 'HIGH IMPACT KEY VISUALS%';

UPDATE portfolio_projects
SET 
  title = 'SOCIAL MEDIA CAMPAIGNS & INFOGRAPHICS',
  description = 'Turning dense information into clean, readable graphics for social media feeds, local government campaigns, and public safety announcements.'
WHERE title ILIKE 'HIGH-IMPACT INFORMATION DESIGN%' OR title ILIKE 'HIGH IMPACT INFORMATION DESIGN%';

UPDATE portfolio_projects
SET 
  title = 'UI/UX & WEB APP DESIGN',
  description = 'Designing intuitive, mobile-optimized interfaces for web apps. From wireframing the user journey to building out the final frontend layout.'
WHERE title ILIKE 'END-TO-END MOBILE-FIRST%' OR title ILIKE 'END TO END MOBILE-FIRST%' OR title ILIKE 'END-TO-END MOBILE FIRST%';

UPDATE portfolio_projects
SET 
  title = 'STREET PHOTOGRAPHY',
  description = 'Candid street photography focused on natural lighting, urban architecture, and capturing everyday moments across different communities.'
WHERE title ILIKE 'FRAMES OF THE STREETS%';

UPDATE portfolio_projects
SET 
  title = 'CONCERT & EVENT PHOTOGRAPHY',
  description = 'Shooting live music and stage performances. I focus on capturing the energy of the crowd and the artists under challenging, fast-changing stage lights.'
WHERE title ILIKE 'LIVE MUSIC & STAGE PERFORMANCE%' OR title ILIKE 'LIVE MUSIC AND STAGE PERFORMANCE%';

UPDATE portfolio_projects
SET 
  title = 'EDITORIAL & STREET PORTRAITS',
  description = 'Photojournalistic coverage of local events and parades. Focused on raw emotion, vibrant color grading, and authentic community storytelling.'
WHERE title ILIKE 'FACES OF PRIDE%';
