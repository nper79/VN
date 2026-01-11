import React, { useState, useEffect, useCallback } from 'react';
import { ParsedScript, Character, Scene, LineType } from '../types';

interface VisualNovelPlayerProps {
  script: ParsedScript;
  characters: Character[];
  scenes: Scene[];
  onRestart: () => void;
}

export const VisualNovelPlayer: React.FC<VisualNovelPlayerProps> = ({ script, characters, scenes, onRestart }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentScene, setCurrentScene] = useState<string | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<{ name: string; emotion: string } | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentLine = script.lines[currentLineIndex];

  // Helper to resolve image resources
  const getSceneImage = (id?: string) => scenes.find(s => s.id === id)?.image || scenes[0]?.image;
  const getCharacterImage = (name: string, emotion: string) => {
    const char = characters.find(c => c.name.toLowerCase() === name.toLowerCase());
    return char?.visuals[emotion] || char?.visuals['neutral'];
  };

  // Process logic when line changes
  useEffect(() => {
    if (!currentLine) return;

    // Handle Scenery Changes
    if (currentLine.type === LineType.SCENE_HEADING) {
      // Find the closest scene match or just use description
      // For simplicity in this demo, we assume the parsing mapped sceneDescription to an ID we generated
      // But actually, we need to do a fuzzy match or just look for scene changes
      const foundScene = scenes.find(s => 
        currentLine.sceneDescription && s.description.includes(currentLine.sceneDescription)
      );
      if (foundScene) setCurrentScene(foundScene.id);
    } 
    // If we have a line with a sceneDescription (narrative change), update it
    else if (currentLine.sceneDescription) {
       const foundScene = scenes.find(s => s.description === currentLine.sceneDescription);
       if (foundScene) setCurrentScene(foundScene.id);
    }

    // Handle Character Updates
    if (currentLine.type === LineType.DIALOGUE) {
      if (currentLine.speaker) {
        setActiveCharacter({
          name: currentLine.speaker,
          emotion: currentLine.emotion || 'neutral'
        });
      }
    } else if (currentLine.type === LineType.THOUGHT && currentLine.speaker) {
        setActiveCharacter({
            name: currentLine.speaker,
            emotion: 'thinking' // fallback to neutral if not generated
        });
    } else if (currentLine.type === LineType.SCENE_HEADING || currentLine.type === LineType.NARRATION) {
        // Optional: clear character on scene change or keep them?
        // Usually, keep them until explicitly removed or scene change
        if (currentLine.type === LineType.SCENE_HEADING) {
            setActiveCharacter(null);
        }
    }
    
    // Explicit Visual Cues for Sprites
    if (currentLine.visualCue) {
        // e.g., "Sprite of MAYA appears"
        // This is tricky to parse perfectly without more complex logic, 
        // relying on the Dialogue flow is safer for this MVP.
    }

    // Text Typing Effect
    setDisplayedText('');
    setIsTyping(true);
    let charIndex = 0;
    const text = currentLine.text || (currentLine.type === LineType.SCENE_HEADING ? `Scene: ${currentLine.sceneDescription}` : '');
    
    const interval = setInterval(() => {
      charIndex++;
      setDisplayedText(text.slice(0, charIndex));
      if (charIndex >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30); // Speed of typing

    return () => clearInterval(interval);
  }, [currentLineIndex, currentLine, scenes]);

  const advance = useCallback(() => {
    if (isTyping) {
      // Skip typing
      const text = currentLine.text || (currentLine.type === LineType.SCENE_HEADING ? `Scene: ${currentLine.sceneDescription}` : '');
      setDisplayedText(text);
      setIsTyping(false);
    } else {
      if (currentLineIndex < script.lines.length - 1) {
        setCurrentLineIndex(prev => prev + 1);
      } else {
          // End of game
      }
    }
  }, [isTyping, currentLine, currentLineIndex, script.lines.length]);

  // Initial Scene Setup
  useEffect(() => {
    if (scenes.length > 0 && !currentScene) {
      setCurrentScene(scenes[0].id);
    }
  }, [scenes, currentScene]);


  // Keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        advance();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advance]);

  if (!currentLine) return <div className="text-white">End of Script</div>;

  const bgImage = getSceneImage(currentScene || undefined);
  const charImage = activeCharacter ? getCharacterImage(activeCharacter.name, activeCharacter.emotion) : null;
  const isThought = currentLine.type === LineType.THOUGHT;

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden select-none cursor-pointer"
      onClick={advance}
    >
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Character Layer */}
      {/* We use a container to center the character */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        {charImage && (
          <img 
            key={activeCharacter?.name} // Force re-render on char switch for anim
            src={charImage} 
            alt="Character" 
            className={`
                max-h-[85%] w-auto object-contain transition-all duration-500 ease-out 
                animate-in slide-in-from-bottom-10 fade-in
                ${isThought ? 'opacity-80 grayscale-[0.3]' : 'opacity-100'}
            `}
            style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
          />
        )}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* UI Layer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 pb-8 flex flex-col items-center">
        
        {/* Speaker Name Tag */}
        {(currentLine.speaker && currentLine.type !== LineType.NARRATION) && (
           <div className="w-full max-w-4xl mb-0 z-20 flex justify-start">
               <div className="bg-indigo-600 text-white px-6 py-2 rounded-t-lg font-bold text-xl shadow-lg transform translate-y-1">
                 {currentLine.speaker}
               </div>
           </div>
        )}

        {/* Dialogue Box */}
        <div className={`
            w-full max-w-4xl min-h-[160px] 
            backdrop-blur-md border border-white/10 rounded-xl rounded-tl-none
            p-8 shadow-2xl relative
            ${currentLine.type === LineType.NARRATION ? 'bg-slate-900/80 italic text-center flex items-center justify-center' : 'bg-slate-900/90'}
            ${isThought ? 'border-indigo-400/30' : ''}
        `}>
            <p className={`
                text-white leading-relaxed
                ${currentLine.type === LineType.NARRATION ? 'text-xl text-slate-300' : 'text-xl md:text-2xl'}
                ${isThought ? 'text-indigo-200 italic' : ''}
            `}>
                {isThought && <span className="not-italic mr-2 opacity-50">(Thinking)</span>}
                {displayedText}
                {!isTyping && (
                    <span className="inline-block w-2.5 h-5 ml-1 bg-white animate-pulse align-middle" />
                )}
            </p>

             {/* Continue Indicator */}
             {!isTyping && (
                <div className="absolute bottom-4 right-4 text-white/50 text-sm animate-bounce">
                    Click to continue ▼
                </div>
            )}
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button 
            onClick={(e) => { e.stopPropagation(); onRestart(); }}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
            title="Restart"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12"/></svg>
        </button>
      </div>

      {/* Debug Info (Optional, hidden in prod) */}
      {/* <div className="absolute top-4 left-4 text-xs text-white/30 font-mono">
          Scene: {currentScene} | Line: {currentLineIndex} | Emotion: {activeCharacter?.emotion}
      </div> */}
    </div>
  );
};
