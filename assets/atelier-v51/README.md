# Course covers from the app pipeline

Scene planning: gpt-5.4-mini, using the actual buildCourseCoverSceneInput, makeCourseCoverVisualSeed and courseCoverSceneSchema functions extracted from supabase/functions/ai-course-creation/index.ts. Course briefs describe each requested website topic.

Rendering: built-in image generation with the actual buildCourseCoverPrompt output with no external image reference. The reference-image instruction was removed to prevent character copying. Roman scene planning requested architecture without people; its render was edited to correct the aqueduct.

The four *-pipeline.json files record the exact writer input, visual variation, writer output, and complete renderer prompt. JPEGs are 640px website exports. Original generated PNGs are preserved in the Codex generated_images directory.