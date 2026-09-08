UPDATE site_content
SET value = CASE key
  WHEN 'subtitle' THEN 'Video Editor • Graphics Artist'
  WHEN 'description' THEN 'I''m Ian Lester Eclevia — a video editor and graphics artist creating polished visual stories, expressive motion, and memorable brand content.'
END
WHERE section = 'hero'
  AND key IN ('subtitle', 'description');

UPDATE site_content
SET value = CASE key
  WHEN 'description_line1' THEN 'I''m Ian Lester Eclevia — a video editor and graphics artist who turns ideas into clear, polished, and expressive visual stories.'
  WHEN 'description_line2' THEN 'From editing and motion graphics to digital illustration and brand visuals, I shape every frame with purpose, rhythm, and detail.'
  WHEN 'description_line3' THEN 'My work combines strong visual direction with careful post-production to create content that feels distinctive and ready to share.'
  WHEN 'skill_1_name' THEN 'Video Editing & Post-Production'
END
WHERE section = 'about'
  AND key IN ('description_line1', 'description_line2', 'description_line3', 'skill_1_name');

UPDATE site_content
SET value = CASE key
  WHEN 'service1_title' THEN 'Graphic Design'
  WHEN 'service1_desc' THEN 'Bold visual systems, layouts, and artwork built with clarity and a distinct point of view.'
  WHEN 'service2_title' THEN 'Video Editing'
  WHEN 'service2_desc' THEN 'Cinematic edits, pacing, sound, and finishing that turn raw footage into a compelling story.'
  WHEN 'service3_title' THEN 'Motion Graphics'
  WHEN 'service3_desc' THEN 'Animated titles, transitions, visual effects, and kinetic graphics that give content energy.'
  WHEN 'service4_title' THEN 'Digital Illustration'
  WHEN 'service4_desc' THEN 'Custom digital artwork and illustrated assets that bring concepts to life.'
  WHEN 'service5_title' THEN 'Brand Identity'
  WHEN 'service5_desc' THEN 'Distinctive logos, typography, color, and visual direction for a coherent brand presence.'
  WHEN 'service6_title' THEN 'Visual Content Production'
  WHEN 'service6_desc' THEN 'End-to-end visual content shaped from concept through design, edit, and final delivery.'
END
WHERE section = 'services'
  AND key IN ('service1_title', 'service1_desc', 'service2_title', 'service2_desc', 'service3_title', 'service3_desc', 'service4_title', 'service4_desc', 'service5_title', 'service5_desc', 'service6_title', 'service6_desc');