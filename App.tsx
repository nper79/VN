import React, { useState } from 'react';
import { ScreenState, ParsedScript, Character, Scene, GenerationProgress } from './types';
import { ScriptEditor } from './components/ScriptEditor';
import { AssetGenerator } from './components/AssetGenerator';
import { VisualNovelPlayer } from './components/VisualNovelPlayer';
import { parseScriptWithGemini, generateCharacterSprite, generateBackground } from './services/geminiService';

const INITIAL_SCRIPT = `[Scene: Interior of "Bean & Leaf" Coffee Shop. Morning. Soft jazz music playing in the background.]

[Narrator] The smell of roasted coffee beans and cinnamon hit me the moment I opened the door. It was the best part of my morning routine.

[Liam] (Thinking) Okay, Liam. Just order the coffee. Don't say anything stupid today.

[Narrator] I walked up to the counter. The shop was relatively empty, which meant she wasn't too busy.

[Narrator] Maya was wiping down the espresso machine. She looked up, and her face immediately brightened into that smile that always made my stomach do a flip.

[Sprite of MAYA appears. She is smiling and wearing a green apron.]

[Maya] Well, look who finally woke up. I was starting to think you cheated on us with the Starbucks across the street.

[Liam] Never. Their coffee tastes like burnt water. Besides... the view here is better.`;

export default function App() {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.EDITOR);
  const [rawScript, setRawScript] = useState(INITIAL_SCRIPT);
  const [parsedScript, setParsedScript] = useState<ParsedScript | null>(null);
  
  // Asset State
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  
  // Progress State
  const [progress, setProgress] = useState<GenerationProgress>({ total: 0, current: 0, status: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const processScript = async () => {
    setIsProcessing(true);
    try {
      // 1. Parse Script
      const result = await parseScriptWithGemini(rawScript);
      
      // Defensive check for parsing result
      if (!result || !result.scenes || !result.characters) {
        throw new Error("Invalid script analysis result");
      }

      setParsedScript(result);
      
      setScreen(ScreenState.GENERATING);
      
      // Calculate work
      // Every scene needs 1 BG.
      // Every character needs 7 expressions (neutral, happy, laughing, speaking, sad, angry, shy).
      const expressions = ['neutral', 'happy', 'laughing', 'sad', 'angry', 'shy', 'speaking'];
      const totalTasks = result.scenes.length + (result.characters.length * expressions.length);
      
      setProgress({ total: totalTasks, current: 0, status: 'Initializing Creative Engine...' });

      const newScenes: Scene[] = [];
      const newCharacters: Character[] = [];

      // 2. Generate Scenes
      for (const scene of result.scenes) {
        // Fallback for missing descriptions
        const desc = scene.description || "A detailed anime background scene";
        setProgress(prev => ({ ...prev, status: `Painting background: ${desc.substring(0, 30)}...` }));
        const bgBase64 = await generateBackground(desc);
        newScenes.push({ ...scene, description: desc, image: bgBase64 });
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }
      setScenes(newScenes);

      // 3. Generate Characters
      for (const char of result.characters) {
        const charDesc = char.description || "Anime character";
        const visuals: Record<string, string> = {};
        for (const expr of expressions) {
            setProgress(prev => ({ ...prev, status: `Drawing ${char.name} (${expr})...` }));
            try {
                const spriteBase64 = await generateCharacterSprite(char.name, charDesc, expr);
                visuals[expr] = spriteBase64;
            } catch (e) {
                console.error(`Failed to gen ${char.name} ${expr}`, e);
                // Fallback or retry logic could go here
            }
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
        newCharacters.push({ ...char, description: charDesc, visuals });
      }
      setCharacters(newCharacters);

      setProgress(prev => ({ ...prev, status: 'Finalizing game assets...' }));

    } catch (error) {
      console.error(error);
      alert("Failed to process script. Please check your API Key and try again.");
      setScreen(ScreenState.EDITOR);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {screen === ScreenState.EDITOR && (
        <ScriptEditor 
          value={rawScript} 
          onChange={setRawScript} 
          onNext={processScript}
          isProcessing={isProcessing}
        />
      )}

      {screen === ScreenState.GENERATING && (
        <AssetGenerator 
          progress={progress}
          characters={characters}
          scenes={scenes}
          onPlay={() => setScreen(ScreenState.PLAYING)}
        />
      )}

      {screen === ScreenState.PLAYING && parsedScript && (
        <VisualNovelPlayer 
          script={parsedScript}
          characters={characters}
          scenes={scenes}
          onRestart={() => setScreen(ScreenState.EDITOR)}
        />
      )}
    </div>
  );
}