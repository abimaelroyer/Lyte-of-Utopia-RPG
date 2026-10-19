// Animated character sprites.
//
// Every clip is a horizontal strip of frames (see data/sprites.js). A
// SpriteActor is a <div> whose background slides from frame to frame. All
// actors share one requestAnimationFrame loop, which stops by itself when no
// actor is on screen.
//
// Sprites all face right. Pass { mirror: true } for a character on the right
// side of the stage. The "origin" in data/sprites.js is the point between the
// character's feet, so actors line up on the same ground line regardless of
// clip width.

(() => {
"use strict";

const { DATA } = LOU.data;
const { animationsOn } = LOU.settings;
const actors = new Set();
let rafId = null;

function loop(now) {
    for (const actor of actors) {
        if (!actor.el.isConnected) { actors.delete(actor); continue; }
        actor.tick(now);
    }
    rafId = actors.size ? requestAnimationFrame(loop) : null;
}

function ensureLoop() {
    if (rafId == null && actors.size) rafId = requestAnimationFrame(loop);
}

class SpriteActor {
    constructor(charId, { mirror = false, scale = 1 } = {}) {
        this.charId = charId;
        this.clips = DATA.sprites?.[charId] ?? {};
        this.mirror = mirror;
        this.scale = scale;
        this.el = document.createElement("div");
        this.el.className = "sprite";
        this.el.setAttribute("aria-hidden", "true");
        this.clip = null;
        this.frame = 0;
        this.frameStart = 0;
        this.onDone = null;
        this.holdLast = false;
        this.idleClip = "idle";
        this.play(this.idleClip);
        actors.add(this);
        ensureLoop();
    }

    has(clipName) { return Boolean(this.clips[clipName]); }

    setIdle(clipName) {
        this.idleClip = this.has(clipName) ? clipName : "idle";
        if (!this.clip || this.clip.loop) this.play(this.idleClip);
    }

    // Plays a clip. Looping clips run until replaced; one-shot clips return
    // to the idle clip (or hold their last frame if hold is true) and resolve.
    play(clipName, { hold = false } = {}) {
        const name = this.has(clipName) ? clipName : this.idleClip;
        const clip = this.clips[name];
        if (!clip) return Promise.resolve();
        this.finish();
        this.clipName = name;
        this.clip = clip;
        this.frame = 0;
        this.frameStart = performance.now();
        this.holdLast = hold;
        this.applyClip();

        if (!animationsOn()) {
            this.frame = hold ? clip.frames - 1 : 0;
            if (!clip.loop && !hold) { this.clip = null; this.play(this.idleClip); }
            this.paint();
            return Promise.resolve();
        }
        if (clip.loop) return Promise.resolve();
        return new Promise((resolve) => { this.onDone = resolve; });
    }

    finish() {
        const done = this.onDone;
        this.onDone = null;
        if (done) done();
    }

    applyClip() {
        const c = this.clip;
        const s = this.scale;
        const [ox, oy] = c.origin ?? [c.frameWidth / 2, c.frameHeight];
        Object.assign(this.el.style, {
            width: `${c.frameWidth}px`,
            height: `${c.frameHeight}px`,
            backgroundImage: `url("${c.src}")`,
            backgroundSize: `${c.frameWidth * c.frames}px ${c.frameHeight}px`,
            // The element's (0,0) is placed on the stage anchor; shift so the
            // feet sit on it, then scale/mirror around the feet.
            left: `${-ox}px`,
            top: `${-oy}px`,
            transformOrigin: `${ox}px ${oy}px`,
            transform: `scale(${this.mirror ? -s : s}, ${s})`,
        });
        this.paint();
    }

    paint() {
        if (!this.clip) return;
        this.el.style.backgroundPosition = `${-this.frame * this.clip.frameWidth}px 0px`;
    }

    tick(now) {
        const c = this.clip;
        if (!c || !animationsOn()) return;
        const dur = c.durationsMs?.[this.frame] ?? 160;
        if (now - this.frameStart < dur) return;
        this.frameStart = now;
        if (this.frame < c.frames - 1) {
            this.frame++;
        } else if (c.loop) {
            this.frame = 0;
        } else if (this.holdLast) {
            this.finish();
            return;
        } else {
            this.play(this.idleClip);
            return;
        }
        this.paint();
    }

    destroy() {
        this.finish();
        actors.delete(this);
        this.el.remove();
    }
}

LOU.sprites = { SpriteActor };
})();
