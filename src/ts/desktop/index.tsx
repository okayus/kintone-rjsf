import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

declare const mermaid: any;
interface MermaidViewerProps {
  code: string;
}

const MermaidViewer: React.FC<MermaidViewerProps> = ({ code }) => {
  const mermaidRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mermaidRef.current) {
      try {
        mermaid.initialize({ startOnLoad: false });
        mermaidRef.current.innerHTML = code;
        mermaid.init(undefined, mermaidRef.current);
      } catch (error) {
        console.error("Mermaidの描画に失敗しました:", error);
        mermaidRef.current.innerHTML = "<p>Mermaidの描画に失敗しました</p>";
      }
    }
  }, [code]);

  return <div ref={mermaidRef} />;
};

((PLUGIN_ID) => {
  kintone.events.on(
    ["app.record.detail.show", "app.record.edit.show"],
    (event) => {
      const responseConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
      if (!responseConfig.config) {
        return event;
      }
      const config = JSON.parse(responseConfig.config).config;

      config.settings.forEach((setting: any) => {
        const displaySpace = kintone.app.record.getSpaceElement(
          setting.displaySpace,
        );
        if (!displaySpace) {
          return;
        }
        displaySpace.classList.add("mermaid");

        const mermaidCode = event.record[setting.inputField].value;

        const root = createRoot(displaySpace);
        root.render(
          <div>
            <MermaidViewer code={mermaidCode} />
          </div>,
        );
      });

      return event;
    },
  );
})(kintone.$PLUGIN_ID);
