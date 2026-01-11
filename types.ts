export enum ScreenState {
  EDITOR = 'EDITOR',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
}

export enum LineType {
  DIALOGUE = 'DIALOGUE',
  NARRATION = 'NARRATION',
  THOUGHT = 'THOUGHT',
  SCENE_HEADING = 'SCENE_HEADING',
  ACTION = 'ACTION',
}

export interface ScriptLine {
  id: string;
  type: LineType;
  speaker?: string;
  text: string;
  emotion?: string; // e.g., happy, sad, angry
  sceneDescription?: string; // if type is SCENE_HEADING
  visualCue?: string; // for explicit sprite calls
}

export interface Character {
  name: string;
  description: string;
  visuals: Record<string, string>; // emotion -> base64 image
}

export interface Scene {
  id: string;
  description: string;
  image: string; // base64
}

export interface ParsedScript {
  lines: ScriptLine[];
  characters: { name: string; description: string }[];
  scenes: { id: string; description: string }[];
}

export interface GenerationProgress {
  total: number;
  current: number;
  status: string;
}
