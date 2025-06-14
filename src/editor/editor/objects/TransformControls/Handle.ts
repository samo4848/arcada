import { Graphics, InteractionEvent } from "pixi.js";
import { isMobile } from "react-device-detect";
import { Point } from "../../../../helpers/Point";
import { viewportX, viewportY } from "../../../../helpers/ViewportCoordinates";
import { Furniture } from "../Furniture";
import { TransformLayer } from "./TransformLayer";

// Define WALL_THICKNESS constant at the top of the file
const WALL_THICKNESS = 10; // Adjust this value as needed

export enum HandleType {
    Horizontal,
    Vertical,
    HorizontalVertical,
    Rotate,
    Move
}

export interface IHandleConfig {
    size?: number,
    color?: number,
    type: HandleType,
    target: Furniture,
    pos?: Point
}

export class Handle extends Graphics {
    private type: HandleType;
    private target: Furniture;
    private color: number = 0x000;
    private size: number = 10;

    private active: boolean = false;
    private mouseStartPoint: Point;
    private targetStartPoint: Point;
    private mouseEndPoint: Point;
    private startRotaton: number;
    private startScale: Point;
    private targetStartCenterPoint: Point;
    localCoords: { x: number; y: number; };

    constructor(handleConfig: IHandleConfig) {
        super();
        this.interactive = true;
        
        if (handleConfig.color) {
            this.color = handleConfig.color;
        }

        if (handleConfig.size) {
            this.size = handleConfig.size;
        }

        this.mouseStartPoint = { x: 0, y: 0 };
        this.targetStartPoint = { x: 0, y: 0 };
        this.startScale = { x: 0, y: 0 };
        this.targetStartCenterPoint = { x: 0, y: 0 };
        this.localCoords = { x: 0, y: 0 };
        this.mouseEndPoint = { x: 0, y: 0 };

        this.type = handleConfig.type;
        this.target = handleConfig.target;
        this.buttonMode = true;
        
        this.beginFill(this.color)
            .lineStyle(1, this.color);

        if (isMobile) {
            this.size = this.size * 2.5;
        }

        if (this.type == HandleType.Rotate) {
            this.drawCircle(0, 0, this.size / 1.5).endFill();
            this.pivot.set(this.size / 3, this.size / 3);
        } else {
            this.drawRect(0, 0, this.size, this.size).endFill();
            this.pivot.set(0.5);
        }

        switch (this.type) {
            case HandleType.Move:
                this.cursor = "move";
                break;
            case HandleType.Horizontal:
                this.cursor = "ew-resize";
                break;
            case HandleType.Vertical:
                this.cursor = "ns-resize";
                break;
            case HandleType.HorizontalVertical:
                this.cursor = "nwse-resize";
                break;
            case HandleType.Rotate:
                this.cursor = "wait";
                break;
        }

        if (handleConfig.pos) {
            this.position.set(handleConfig.pos.x, handleConfig.pos.y);
        }

        this.on("pointerdown", this.onMouseDown)
            .on("pointerup", this.onMouseUp)
            .on("pointerupoutside", this.onMouseUp)
            .on("pointermove", this.onMouseMove);
    }

    private onMouseDown(ev: InteractionEvent) {
        if (TransformLayer.dragging) {
            return;
        }
        this.mouseStartPoint.x = ev.data.global.x;
        this.mouseStartPoint.y = ev.data.global.y;
        this.targetStartPoint = this.target.getGlobalPosition();
        this.targetStartCenterPoint.x = this.targetStartPoint.x + this.target.width / 2;
        this.targetStartCenterPoint.y = this.targetStartPoint.y + this.target.height / 2;
        this.localCoords = ev.data.getLocalPosition(this.target);
        this.startRotaton = this.target.rotation;
        this.startScale.x = this.target.scale.x;
        this.startScale.y = this.target.scale.y;
        TransformLayer.dragging = true;
        this.active = true;
        ev.stopPropagation();
    }

    private onMouseUp(ev: InteractionEvent) {
        TransformLayer.dragging = false;
        this.active = false;
        ev.stopPropagation();
    }

    private onMouseMove(ev: InteractionEvent) {
        if (!this.active || !TransformLayer.dragging) {
            return;
        }

        this.mouseEndPoint.x = ev.data.global.x;
        this.mouseEndPoint.y = ev.data.global.y;
        
        let startDistance = this.getDistance(this.mouseStartPoint, this.targetStartPoint);
        let endDistance = this.getDistance(this.mouseEndPoint, this.targetStartPoint);
        let sizeFactor = endDistance / startDistance;

        switch (this.type) {
            case HandleType.Rotate:
                let relativeStart = {
                    x: this.mouseStartPoint.x - this.targetStartPoint.x,
                    y: this.mouseStartPoint.y - this.targetStartPoint.y
                };
                let relativeEnd = {
                    x: this.mouseEndPoint.x - this.targetStartPoint.x,
                    y: this.mouseEndPoint.y - this.targetStartPoint.y
                };

                let endAngle = Math.atan2(relativeEnd.y, relativeEnd.x);
                let startAngle = Math.atan2(relativeStart.y, relativeStart.x);
                let deltaAngle = endAngle - startAngle;
                this.target.rotation = this.startRotaton + deltaAngle;
                break;

            case HandleType.Horizontal:
                this.target.scale.x = this.startScale.x * sizeFactor;
                break;

            case HandleType.Vertical:
                this.target.scale.y = this.startScale.y * sizeFactor;
                break;

            case HandleType.HorizontalVertical:
                this.target.scale.x = this.startScale.x * sizeFactor;
                this.target.scale.y = this.startScale.y * sizeFactor;
                break;

            case HandleType.Move:
                let delta = {
                    x: this.mouseEndPoint.x - this.mouseStartPoint.x,
                    y: this.mouseEndPoint.y - this.mouseStartPoint.y
                };

                if (!this.target.xLocked) {
                    this.target.position.x = viewportX(this.targetStartPoint.x + delta.x);
                    this.target.position.y = viewportY(this.targetStartPoint.y + delta.y);
                } else {
                    let amount = (delta.x + delta.y) * 0.8;
                    
                    // Type assertion for parent with length property
                    const parentWithLength = this.target.parent as any;
                    const parentLength = parentWithLength.length || 0;

                    // Start of wall
                    if (this.localCoords.x + amount <= WALL_THICKNESS * 0.5) {
                        this.target.position.x = WALL_THICKNESS * 0.5;
                    }
                    // End of wall
                    else if (this.localCoords.x + amount >= parentLength - this.target.width - WALL_THICKNESS * 0.5) {
                        this.target.position.x = parentLength - this.target.width - WALL_THICKNESS * 0.5;
                    }
                    // Middle of wall
                    else {
                        this.target.position.x = this.localCoords.x + amount;
                    }
                }
                break;
        }
    }

    private getDistance(src: Point, dest: Point): number {
        return Math.sqrt(Math.pow(dest.x - src.x, 2) + Math.pow(dest.y - src.y, 2));
    }

    public setTarget(target: Furniture): void {
        this.target = target;
    }

    public update(pos: Point): void {
        this.position.set(pos.x, pos.y);
    }
}