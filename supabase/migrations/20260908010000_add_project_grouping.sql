ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS project_group_id uuid;

WITH project_groups AS (
  SELECT DISTINCT ON (category, title)
    category,
    title,
    id AS project_group_id
  FROM portfolio_projects
  ORDER BY category, title, created_at, id
)
UPDATE portfolio_projects AS project
SET project_group_id = groups.project_group_id
FROM project_groups AS groups
WHERE project.project_group_id IS NULL
  AND project.category = groups.category
  AND project.title = groups.title;

UPDATE portfolio_projects
SET project_group_id = gen_random_uuid()
WHERE project_group_id IS NULL;

ALTER TABLE portfolio_projects
  ALTER COLUMN project_group_id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN project_group_id SET NOT NULL;