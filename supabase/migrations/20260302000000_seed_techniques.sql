-- Seed techniques required for routine templates
INSERT INTO public.techniques (id, slug, name, category, instruction, duration_minutes)
VALUES
  ('10b6e1e5-ef39-4403-b9e3-c52a50333ded', 'box_breathing', 'Box Breathing', 'breathing', 'Inhale for 4, hold for 4, exhale for 4, hold for 4.', 2),
  ('851dea98-0f6c-4736-829e-9624bbb4e13a', 'affirmations', 'Confidence Affirmations', 'affirmations', 'Repeat: I am prepared, I am capable, I am focused.', 2),
  ('7fd34016-0b47-4d91-b6d5-51de19955ee5', 'focus_word', 'Focus Word Anchor', 'focus', 'Choose one word (e.g., "Smooth") and repeat it with each breath.', 1),
  ('05ab1ecd-3ba7-4e51-9b9d-71c2a9113966', 'visualization', 'Performance Visualization', 'visualization', 'Visualize yourself executing your skills perfectly in your sport.', 3),
  ('78e33581-7628-4567-820f-d3b11aae6ee7', 'deep_breathing', 'Deep Belly Breathing', 'breathing', 'Breathe deep into your diaphragm for 4 seconds, exhale for 6.', 2),
  ('223f1f32-1e0d-4e2f-8a9e-55719f8cd168', 'body_scan', 'Progressive Body Scan', 'grounding', 'Slowly scan your body from toes to head, releasing tension in each muscle group.', 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  instruction = EXCLUDED.instruction,
  duration_minutes = EXCLUDED.duration_minutes;
