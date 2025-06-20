import { IViewportOptions, PluginManager, Viewport } from "pixi-viewport";
import { Application, InteractionEvent, isMobile, Loader, Point, TilingSprite, Texture } from "pixi.js";
import { FloorPlan } from "./objects/FloorPlan";
import { TransformLayer } from "./objects/TransformControls/TransformLayer";
import { useStore } from "../../stores/EditorStore";
import { AddNodeAction } from "./actions/AddNodeAction";
import { AddWallManager } from "./actions/AddWallManager";
import { viewportX, viewportY } from "../../helpers/ViewportCoordinates";
import { Tool } from "./constants";
import { Pointer } from "./Pointer";
import { Preview } from "./actions/MeasureToolManager";
import { showNotification } from "@mantine/notifications";
import { DeviceFloppy } from "tabler-icons-react";

export class Main extends Viewport {
    private floorPlan: FloorPlan;
    public static viewportPluginManager: PluginManager;
    public static app: Application;
    transformLayer: TransformLayer;
    addWallManager: AddWallManager;
    bkgPattern: TilingSprite;
    public pointer: Pointer;
    public preview: Preview;

    constructor(options: IViewportOptions) {
        super(options);

        // Constructor'ı basitleştiriyoruz. Yükleyici mantığı burada olmayacak.
        this.preview = new Preview();
        this.addChild(this.preview.getReference());
        this.cursor = "none";
    }

    /**
     * Bu metod, viewport sahneye eklendikten sonra EditorRoot.tsx tarafından çağrılacak.
     */
    public init() {
        // Varlık yükleyiciyi başlat
        if (!Loader.shared.resources["bkg_pattern"]) {
             Loader.shared.add("bkg_pattern", "./pattern.svg");
        }
        Loader.shared.onComplete.once(this.setup, this);
        Loader.shared.load();
    }

    private setup() {
        // Eklentileri etkinleştir
        Main.viewportPluginManager = this.plugins;
        
        // Arka plan desenini yüklenmiş varlıktan oluştur
        const texture = Loader.shared.resources["bkg_pattern"].texture as Texture;
        this.bkgPattern = new TilingSprite(texture, this.worldWidth ?? 0, this.worldHeight ?? 0);
        
        // Tüm alt nesneleri sahneye ekle
        this.addChild(this.bkgPattern);

        this.floorPlan = FloorPlan.Instance;
        this.addChild(this.floorPlan);

        this.transformLayer = TransformLayer.Instance;
        this.addChild(this.transformLayer)

        this.addWallManager = AddWallManager.Instance;
        this.addChild(this.addWallManager.preview.getReference())

        this.pointer = new Pointer();
        this.addChild(this.pointer);
        
        // Sahnenin merkezini, TÜM alt nesneler eklendikten SONRA ayarla.
        this.center = new Point(this.worldWidth / 2, this.worldHeight / 2);

        // Olay dinleyicilerini (event listeners) ekle
        this.on("pointerdown", this.checkTools)
        this.on("pointermove", this.updatePreview)
        this.on("pointerup", this.updateEnd)

        // Viewport eklentilerini, tüm kurulum bittikten SONRA başlat.
        this.drag({ mouseButtons: 'right' })
            .clamp({ direction: 'all' })
            .pinch()
            .wheel().clampZoom({ minScale: 1.0, maxScale: 6.0 });
    }

    private updatePreview(ev: InteractionEvent) {
        this.addWallManager.updatePreview(ev);
        this.preview.updatePreview(ev);
        this.pointer.update(ev);
    }

    private updateEnd(ev: InteractionEvent) {
        switch (useStore.getState().activeTool) {
            case Tool.Measure:
                this.preview.set(undefined);
                this.pause = false;
                break;
            case Tool.WallAdd:
                if (!isMobile) {
                    this.pause = false;
                }
                break;
            case Tool.Edit:
                this.pause = false;
                break;
        }
    }

    private checkTools(ev: InteractionEvent) {
        ev.stopPropagation()
        if (ev.data.button == 2) { // Sağ tık kontrolü
            return;
        }
        let point = { x: 0, y: 0 }
        switch (useStore.getState().activeTool) {
            case Tool.WallAdd:
                this.pause = true;
                point.x = viewportX(ev.data.global.x)
                point.y = viewportY(ev.data.global.y);
                let action = new AddNodeAction(undefined, point)
                action.execute();
                break;
            case Tool.Edit:
                // Düzenleme modu mantığı
                break;
            case Tool.Measure:
                this.pause = true;
                point.x = viewportX(ev.data.global.x)
                point.y = viewportY(ev.data.global.y);
                this.preview.set(point);
                break;
        }
    }
}

// Kaydetme fonksiyonu
function save() {
    try {
        const data = FloorPlan.Instance.save();
        localStorage.setItem('autosave', data);
        showNotification({
            message: "Saved to Local Storage!",
            color: "green",
            icon: DeviceFloppy({})
        });
    } catch (e) {
        console.error("Could not save to local storage", e);
        showNotification({
            message: "Could not save project!",
            color: "red"
        });
    }
}

// CTRL+S kısayolu ile kaydetme
document.onkeydown = (e) => {
    if (e.code == "KeyS" && (e.ctrlKey || e.metaKey)) { // Ctrl+S (Windows) ve Cmd+S (Mac)
        e.preventDefault();
        save();
    }
};
