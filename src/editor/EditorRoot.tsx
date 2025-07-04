import { useRef, useEffect } from "react";
import { Application } from "pixi.js";
import { Main } from "./editor/Main";
import { IViewportOptions } from 'pixi-viewport';
import { useStore } from "../stores/EditorStore";
import { createStyles } from "@mantine/core";
import { METER } from "./editor/constants";

const useStyles = createStyles(() => ({
    inactive: {
        display: 'none'
    }
}));

export let main: Main;

export function EditorRoot() {
    const ref = useRef<HTMLDivElement>(null);
    const state = useStore();
    const { classes } = useStyles();

    useEffect(() => {
        // Create canvas element first
        const canvas = document.createElement('canvas');
        canvas.id = 'pixi-canvas';
        ref.current?.appendChild(canvas);

        // Initialize app with canvas passed in constructor
        const app = new Application({
            view: canvas,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundColor: 0xebebeb,
            antialias: true,
            resizeTo: window
        });

        // Prevent context menu
        app.view.oncontextmenu = (e) => {
            e.preventDefault();
        };

        const viewportSettings: IViewportOptions = {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            worldWidth: 50 * METER,
            worldHeight: 50 * METER,
            interaction: app.renderer.plugins.interaction,
        };

        // Initialize main application
        main = new Main(viewportSettings);

        // Start the PixiJS app and add main to stage
        app.start();
        app.stage.addChild(main);

        return () => {
            // Cleanup on unmount
            app.destroy(true, true);
            if (ref.current?.contains(canvas)) {
                ref.current.removeChild(canvas);
            }
        };
    }, []);

    return <div ref={ref} style={{ width: '100vw', height: '100vh' }} />;
}