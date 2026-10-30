"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import CurrentYear from "./current-year";
import Link from "next/link";
import * as THREE from "three";
import styles from "./home-page.module.css";

type Domain = "core" | "backend" | "data" | "ai";

type SkillNode = {
  id: string;
  name: string;
  domain: Domain;
  position: [number, number, number];
  prerequisites: string[];
  description: string;
};

type GraphRuntime = {
  edges: Array<{ line: THREE.Line; from: string; to: string }>;
  meshes: Record<string, THREE.Mesh>;
};

const domains: Record<Domain, { label: string; color: number }> = {
  core: { label: "Core", color: 0x43e8d0 },
  backend: { label: "Backend", color: 0x7aa2ff },
  data: { label: "Data science", color: 0xffc857 },
  ai: { label: "AI/ML", color: 0xff7ab6 },
};

const skills: SkillNode[] = [
  { id: "basics", name: "Programming Basics", domain: "core", position: [0, -3.4, 0], prerequisites: [], description: "Variables, logic and how programs run." },
  { id: "py", name: "Python Fundamentals", domain: "core", position: [0, -2, 0], prerequisites: ["basics"], description: "Syntax, types, control flow and reading errors." },
  { id: "fn", name: "Functions & Modules", domain: "core", position: [-1.3, -0.6, 1], prerequisites: ["py"], description: "Parameters, scope and reusable code." },
  { id: "ds", name: "Data Structures", domain: "core", position: [1.3, -0.6, -1], prerequisites: ["py"], description: "Lists, dictionaries, sets and iteration." },
  { id: "git", name: "Git & Testing", domain: "core", position: [0, 0.7, 2], prerequisites: ["fn"], description: "Version control and basic tests." },
  { id: "http", name: "HTTP & REST", domain: "backend", position: [-3, 0.5, 0.5], prerequisites: ["py"], description: "Request–response and API concepts." },
  { id: "sql", name: "SQL & Databases", domain: "backend", position: [-1.8, 1.6, -1.2], prerequisites: ["ds"], description: "Relational data and queries." },
  { id: "dj", name: "Django", domain: "backend", position: [-3.3, 2, -0.8], prerequisites: ["fn", "http"], description: "Web framework fundamentals." },
  { id: "auth", name: "Auth & Security", domain: "backend", position: [-2.4, 3.2, 0.2], prerequisites: ["dj", "sql"], description: "Authentication, permissions and safe APIs." },
  { id: "np", name: "NumPy & Pandas", domain: "data", position: [2.9, 0.4, -0.6], prerequisites: ["ds"], description: "Arrays, dataframes and data cleaning." },
  { id: "stat", name: "Statistics", domain: "data", position: [3.3, 1.8, 0.9], prerequisites: ["py"], description: "Probability and inference basics." },
  { id: "ml", name: "ML Fundamentals", domain: "ai", position: [2.8, 3.1, -0.2], prerequisites: ["np", "stat"], description: "Model training and evaluation." },
];

const roadmapStages = [
  ["Setup & orientation", "Run your first program; read basic errors."],
  ["Variables & data", "Types, strings, input/output and operators."],
  ["Control flow", "Conditions and loops."],
  ["Core data structures", "Lists, tuples, sets, dictionaries and slicing."],
  ["Functions & organization", "Parameters, scope and modules."],
  ["Practical Python", "Exceptions, files, JSON and debugging."],
  ["Professional foundations", "Virtual environments, packages, testing and Git."],
  ["Practical projects", "Small CLI apps, refactoring and documentation."],
] as const;

const terminalLines = [
  "$ enigma init --campus nielit-csn",
  "✓ skill graph loaded",
  "✓ python-foundations → reusable across paths",
  "",
  "$ enigma next",
  "→ Functions & Modules",
  "  prerequisite: Python Fundamentals ✓",
];

const skillsById = Object.fromEntries(skills.map((skill) => [skill.id, skill])) as Record<string, SkillNode>;

function paintGraph(runtime: GraphRuntime, selectedId: string) {
  for (const edge of runtime.edges) {
    const selected = edge.from === selectedId || edge.to === selectedId;
    const material = edge.line.material as THREE.LineBasicMaterial;
    material.opacity = selected ? 1 : 0.16;
    material.color.setHex(selected ? 0x43e8d0 : 0x4a6a80);
  }

  for (const [id, mesh] of Object.entries(runtime.meshes)) {
    mesh.scale.setScalar(id === selectedId ? 1.6 : 1);
  }
}

function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    const characters = "01<>{}/;=+*#".split("");
    let columns: number[] = [];
    let intervalId: number | undefined;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      context.fillStyle = "#080d12";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const fontSize = 16 * ratio;
      columns = Array.from(
        { length: Math.ceil(canvas.width / fontSize) },
        () => (Math.random() * canvas.height) / fontSize,
      );
    };

    const draw = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const fontSize = 16 * ratio;
      context.fillStyle = "rgba(8, 13, 18, 0.1)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = fontSize + "px monospace";
      columns.forEach((column, index) => {
        context.fillStyle = Math.random() > 0.975 ? "#f2f7fa" : "#43e8d0";
        context.fillText(
          characters[Math.floor(Math.random() * characters.length)],
          index * fontSize,
          column * fontSize,
        );
        columns[index] =
          column * fontSize > canvas.height && Math.random() > 0.975
            ? 0
            : column + 1;
      });
    };

    const start = () => {
      if (intervalId === undefined) {
        intervalId = window.setInterval(draw, 55);
      }
    };
    const stop = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (let index = 0; index < 80; index += 1) {
        draw();
      }
      return () => window.removeEventListener("resize", resize);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        start();
      } else {
        stop();
      }
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      stop();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.rain} aria-hidden="true" />;
}

function TerminalPreview() {
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = window.setTimeout(
        () => setLineCount(terminalLines.length),
        0,
      );
      return () => window.clearTimeout(timer);
    }

    const timers = terminalLines.map((_, index) => {
      const delay = terminalLines
        .slice(0, index)
        .reduce((total, line) => total + (line ? 380 : 700), 0);
      return window.setTimeout(() => setLineCount(index + 1), delay);
    });
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <div className={styles.terminal} aria-label="Illustrative terminal preview">
      <div className={styles.terminalBar} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <pre>
        {terminalLines.slice(0, lineCount).join("\n")}
        {lineCount === terminalLines.length && <span className={styles.caret} />}
      </pre>
    </div>
  );
}

function SkillGraph({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const runtimeRef = useRef<GraphRuntime | null>(null);
  const selectedRef = useRef(selectedId);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    selectedRef.current = selectedId;
    if (runtimeRef.current) {
      paintGraph(runtimeRef.current, selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      const frame = window.requestAnimationFrame(() => setUnavailable(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 11.5);
    const group = new THREE.Group();
    group.position.y = -0.2;
    scene.add(group);

    const meshes: Record<string, THREE.Mesh> = {};
    const edges: GraphRuntime["edges"] = [];
    skills.forEach((skill) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 20, 20),
        new THREE.MeshBasicMaterial({ color: domains[skill.domain].color }),
      );
      mesh.position.set(...skill.position);
      mesh.userData.id = skill.id;
      const halo = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.4, 1),
        new THREE.MeshBasicMaterial({
          color: domains[skill.domain].color,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        }),
      );
      mesh.add(halo);
      group.add(mesh);
      meshes[skill.id] = mesh;

      skill.prerequisites.forEach((prerequisite) => {
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...skillsById[prerequisite].position),
            new THREE.Vector3(...skill.position),
          ]),
          new THREE.LineBasicMaterial({
            color: 0x4a6a80,
            transparent: true,
            opacity: 0.3,
          }),
        );
        group.add(line);
        edges.push({ line, from: prerequisite, to: skill.id });
      });
    });

    const starPositions = new Float32Array(600);
    for (let index = 0; index < starPositions.length; index += 1) {
      starPositions[index] = (Math.random() - 0.5) * 26;
    }
    const stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, 3),
      ),
      new THREE.PointsMaterial({
        color: 0x43e8d0,
        size: 0.04,
        transparent: true,
        opacity: 0.5,
      }),
    );
    scene.add(stars);

    const runtime = { edges, meshes };
    runtimeRef.current = runtime;
    paintGraph(runtime, selectedRef.current);

    const labelPosition = new THREE.Vector3();
    const updateLabels = () => {
      scene.updateMatrixWorld();

      for (const [id, mesh] of Object.entries(meshes)) {
        const label = labelRefs.current[id];
        if (!label) {
          continue;
        }

        mesh.getWorldPosition(labelPosition);
        labelPosition.project(camera);
        label.style.left = `${((labelPosition.x + 1) / 2) * 100}%`;
        label.style.top = `${((-labelPosition.y + 1) / 2) * 100}%`;
        label.hidden = labelPosition.z < -1 || labelPosition.z > 1;
        label.dataset.active = String(id === selectedRef.current);
      }
    };

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 600 ? 15 : 11.5;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      host.setPointerCapture(event.pointerId);
      host.classList.add(styles.dragging);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) {
        return;
      }
      const xDelta = event.clientX - lastX;
      const yDelta = event.clientY - lastY;
      moved += Math.abs(xDelta) + Math.abs(yDelta);
      lastX = event.clientX;
      lastY = event.clientY;
      group.rotation.y += xDelta * 0.006;
      group.rotation.x = Math.max(-0.6, Math.min(0.6, group.rotation.x + yDelta * 0.004));
    };
    const pointerUp = (event: PointerEvent) => {
      dragging = false;
      host.classList.remove(styles.dragging);
      if (host.hasPointerCapture(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
      if (moved > 6) {
        return;
      }
      const bounds = host.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(Object.values(meshes), false)[0];
      if (hit) {
        onSelect(hit.object.userData.id as string);
      }
    };

    host.addEventListener("pointerdown", pointerDown);
    host.addEventListener("pointermove", pointerMove);
    host.addEventListener("pointerup", pointerUp);

    let frameId = 0;
    const render = (time: number) => {
      if (!reducedMotion && !dragging) {
        group.rotation.y += 0.0025;
      }
      stars.rotation.y = group.rotation.y * 0.3;
      Object.values(meshes).forEach((mesh) => {
        mesh.children[0].rotation.y = time * 0.0005;
      });
      updateLabels();
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      host.removeEventListener("pointerdown", pointerDown);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerup", pointerUp);
      renderer.dispose();
      renderer.domElement.remove();
      runtimeRef.current = null;
    };
  }, [onSelect]);

  const className =
    styles.graphCanvas + (unavailable ? " " + styles.graphUnavailable : "");
  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-label="Interactive 3D skill graph. Drag to rotate or select a skill from the list."
    >
      {unavailable && (
        <p className={styles.graphFallback}>
          3D view is unavailable in this browser. Use the skill list instead.
        </p>
      )}
      <div className={styles.graphLabels} aria-hidden="true">
        {skills.map((skill) => (
          <span
            className={styles.graphLabel}
            data-active={skill.id === selectedId}
            key={skill.id}
            ref={(element) => {
              labelRefs.current[skill.id] = element;
            }}
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("py");
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 40);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(
          window.localStorage.getItem("enigma-preview-progress") ?? "[]",
        );
        if (Array.isArray(stored)) {
          setCompletedStages(
            stored.filter(
              (stage): stage is number =>
                Number.isInteger(stage) &&
                stage >= 0 &&
                stage < roadmapStages.length,
            ),
          );
        }
      } catch {
        // Ignore malformed prototype-only local progress.
      } finally {
        setProgressReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (progressReady) {
      window.localStorage.setItem(
        "enigma-preview-progress",
        JSON.stringify(completedStages),
      );
    }
  }, [completedStages, progressReady]);

  const selectedSkill = skillsById[selectedSkillId];
  const unlockedSkills = useMemo(
    () => skills.filter((skill) => skill.prerequisites.includes(selectedSkill.id)),
    [selectedSkill.id],
  );
  const reusedByDomains = useMemo(() => {
    const collected = new Set<Domain>();
    const visit = (node: SkillNode) => {
      skills
        .filter((skill) => skill.prerequisites.includes(node.id))
        .forEach((next) => {
          collected.add(next.domain);
          visit(next);
        });
    };
    visit(selectedSkill);
    collected.delete(selectedSkill.domain);
    return [...collected].map((domain) => domains[domain].label);
  }, [selectedSkill]);
  const percent = Math.round((completedStages.length / roadmapStages.length) * 100);

  const closeMenu = () => setMenuOpen(false);
  const selectSkill = useCallback((id: string) => setSelectedSkillId(id), []);
  const toggleStage = (stage: number) => {
    setCompletedStages((current) =>
      current.includes(stage)
        ? current.filter((item) => item !== stage)
        : [...current, stage],
    );
  };
  const headerClassName =
    styles.header + (scrolled || menuOpen ? " " + styles.headerActive : "");
  const linksClassName =
    styles.links + (menuOpen ? " " + styles.linksOpen : "");

  return (
    <main className={styles.home}>
      <header className={headerClassName}>
        {/* ROW 1: Institutional branding */}
        <div className={styles.brandingRow}>
          <div className={styles.wrap}>
            <Link
              href="/"
              className={styles.branding}
              aria-label="ENIGMA Coding Club home"
            >
              <Image
                src="/nielit-logo.png"
                alt="NIELIT"
                width={220}
                height={100}
                className={styles.nielitLogo}
                priority
              />

              <div className={styles.brandDivider} aria-hidden="true" />

              <Image
                src="/enigma-logo.jpeg"
                alt="ENIGMA"
                width={64}
                height={64}
                className={styles.enigmaLogo}
                priority
              />

              <div className={styles.brandText}>
                <span className={styles.brandTitle}>ENIGMA</span>
                <span className={styles.brandSubtitle}>
                  NIELIT Chhatrapati Sambhajinagar
                </span>
                <span className={styles.brandDescriptor}>
                  CODING CLUB 
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* ROW 2: Navigation */}
        <div className={styles.navigationRow}>
          <div className={styles.wrap}>
            <div className={styles.nav}>
              <Link
                href="/"
                className={styles.mobileBrand}
                aria-label="ENIGMA home"
              >
                ENIGMA<span>.</span>
              </Link>

              <button
                type="button"
                className={styles.menuButton}
                aria-expanded={menuOpen}
                aria-controls="main-navigation"
                aria-label="Toggle navigation menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? "×" : "☰"}
              </button>

              <nav
                id="main-navigation"
                className={linksClassName}
                aria-label="Main navigation"
              >
                <a href="#about" onClick={closeMenu}>About</a>
                <a href="#skills-graph" onClick={closeMenu}>Learn</a>
                <a href="#projects" onClick={closeMenu}>Projects</a>
                <a href="#events" onClick={closeMenu}>Events</a>

                <Link href="/members" onClick={closeMenu}>
                  Members
                </Link>

                <Link href="/login" onClick={closeMenu}>
                  Sign in
                </Link>

                <Link
                  href="/membership"
                  className={styles.button + " " + styles.primary}
                  onClick={closeMenu}
                >
                  Join ENIGMA
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <section className={styles.hero} id="hero">
        <DigitalRain />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.wrap + " " + styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>NIELIT Chhatrapati Sambhajinagar · Coding Club</p>
            <h1>Decode the code.<br /><em>Build what matters.</em></h1>
            <p className={styles.heroLead}>
              ENIGMA is a coding community and a structured learning ecosystem.
              Learn a skill once, reuse it across every path, and always know what
              to learn next.
            </p>
            <div className={styles.cta}>
              <a href="#skills-graph" className={styles.button + " " + styles.primary}>
                Explore learning roadmaps →
              </a>
              <Link href="/membership" className={styles.button + " " + styles.secondary}>
                Join the club
              </Link>
            </div>
          </div>
          <TerminalPreview />
        </div>
      </section>

      <section id="about">
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>What we do</p>
          <h2>One club. Three habits.</h2>
          <p className={styles.lead}>
            Everything on this platform serves one of these ideas — no decorative
            pages, no inflated numbers.
          </p>
          <div className={styles.cardGrid}>
            {[
              ["01 / LEARN", "Learn", "Structured roadmaps built from reusable skills with explicit prerequisites."],
              ["02 / BUILD", "Build", "Projects, exercises and experiments that turn knowledge into engineering."],
              ["03 / COLLABORATE", "Collaborate", "Peer learning, mentorship, events and shared contribution across the campus."],
            ].map(([number, title, description]) => (
              <article className={styles.card} key={title}>
                <p className={styles.cardNumber}>{number}</p>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills-graph">
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>The skill graph</p>
          <h2>Skills are shared. Paths are combinations.</h2>
          <p className={styles.lead}>
            Drag to rotate or select a node to see prerequisites and where the
            skill is reused. This is a draft curriculum map for exploration;
            dependencies are reviewed by the core team before publishing.
          </p>
          <div className={styles.graphLayout}>
            <div className={styles.graphShell}>
              <SkillGraph selectedId={selectedSkillId} onSelect={selectSkill} />
              <span className={styles.graphHint}>drag · tap a node</span>
            </div>
            <aside className={styles.graphSide}>
              <article className={styles.card}>
                <h3>{selectedSkill.name}</h3>
                <span className={styles.tag}>{domains[selectedSkill.domain].label}</span>
                <p>{selectedSkill.description}</p>
                <dl className={styles.details}>
                  <dt>Prerequisites</dt>
                  <dd>
                    {selectedSkill.prerequisites.length
                      ? selectedSkill.prerequisites.map((id) => skillsById[id].name).join(", ")
                      : "None — a starting point"}
                  </dd>
                  <dt>Unlocks</dt>
                  <dd>
                    {unlockedSkills.length
                      ? unlockedSkills.map((skill) => skill.name).join(", ")
                      : "End of this draft map"}
                  </dd>
                  <dt>Reused by</dt>
                  <dd>{reusedByDomains.length ? reusedByDomains.join(", ") : "—"}</dd>
                </dl>
              </article>
              <div className={styles.skillList} aria-label="All skills">
                {skills.map((skill) => (
                  <button
                    type="button"
                    key={skill.id}
                    aria-pressed={skill.id === selectedSkillId}
                    onClick={() => selectSkill(skill.id)}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
              <div className={styles.legend}>
                {(Object.keys(domains) as Domain[]).map((domain) => (
                  <span key={domain}>
                    <i
                      aria-hidden="true"
                      style={{ backgroundColor: "#" + domains[domain].color.toString(16).padStart(6, "0") }}
                    />
                    {domains[domain].label}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="roadmap">
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Python Foundations</p>
          <h2>The first reference roadmap</h2>
          <p className={styles.lead}>
            <span className={styles.tag + " " + styles.warning}>In development</span>{" "}
            A preview of the planned stages. Ticks are self-reported in this
            browser only; real progress will be saved by the ENIGMA backend, and
            verified mastery will need assessments.
          </p>
          <div className={styles.roadmap}>
            <article className={styles.card + " " + styles.progressCard}>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle className={styles.progressBackground} cx="60" cy="60" r="52" />
                <circle
                  className={styles.progressForeground}
                  cx="60"
                  cy="60"
                  r="52"
                  strokeDasharray="326.7"
                  strokeDashoffset={326.7 * (1 - completedStages.length / roadmapStages.length)}
                />
              </svg>
              <div className={styles.progressNumber}>{percent}%</div>
              <small>{completedStages.length} of {roadmapStages.length} stages self-reported</small>
            </article>
            <ol className={styles.stages}>
              {roadmapStages.map(([title, description], index) => (
                <li key={title}>
                  <input
                    id={"stage-" + index}
                    type="checkbox"
                    checked={completedStages.includes(index)}
                    onChange={() => toggleStage(index)}
                    aria-label={"Mark " + title + " as self-reported complete"}
                  />
                  <label htmlFor={"stage-" + index}>
                    <em>STAGE {index + 1}</em>
                    <b>{title}</b>
                    <span>{description}</span>
                  </label>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="projects">
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Projects</p>
          <h2>Featured projects</h2>
          <div className={styles.empty}>
            <b>No projects published yet</b>
            Approved club projects will appear here with their stack, status and
            verified links.
          </div>
        </div>
      </section>

      <section id="events">
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Events</p>
          <h2>Upcoming events</h2>
          <div className={styles.empty}>
            <b>No events scheduled</b>
            Workshops, contests and meetups will be listed here once the core team
            publishes them.
          </div>
        </div>
      </section>

      <section className={styles.join} id="join">
        <div className={styles.wrap}>
          <div className={styles.card + " " + styles.joinBox}>
            <p className={styles.eyebrow}>Membership</p>
            <h2>Ready to decode?</h2>
            <p className={styles.lead}>
              Apply with your interests and motivation. The core team reviews every
              application and gives feedback.
            </p>
            <Link href="/membership" className={styles.button + " " + styles.primary}>
              Apply for membership
            </Link>
          </div>
        </div>
      </section>


      <footer className={styles.footer}>
        <div className={styles.wrap}>
          {/* Main footer */}
          <div className={styles.footerMain}>
            {/* Brand */}
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.logo} aria-label="ENIGMA home">
                <Image
                  src="/enigma-logo.jpeg"
                  alt=""
                  width={40}
                  height={40}
                  className={styles.logoImage}
                  priority
                />
                <span>ENIGMA</span>
              </Link>

              <p className={styles.footerDescription}>
                A community of builders, problem-solvers, and curious minds
                at NIELIT Chhatrapati Sambhajinagar.
              </p>

              <p className={styles.footerTagline}>
                Learn together. Build fearlessly. Create impact.
              </p>

              <Link href="/membership" className={styles.footerCTA}>
                Become a member <span aria-hidden="true">↗</span>
              </Link>
            </div>

            {/* Explore */}
            <div className={styles.footerColumn}>
              <h3>Explore</h3>
              <nav aria-label="Explore ENIGMA">
                <a href="#about">About the Club</a>
                <a href="#skills-graph">Learning Roadmap</a>
                <a href="#projects">Projects</a>
                <a href="#events">Events & Activities</a>
                <Link href="/members">Our Members</Link>
                <Link href="/membership">Membership</Link>
              </nav>
            </div>

            {/* Learning */}
            <div className={styles.footerColumn}>
              <h3>Learning Resources</h3>
              <nav aria-label="Learning resources">
                <a href="https://docs.python.org/3/" target="_blank" rel="noreferrer">
                  Python Documentation ↗
                </a>
                <a href="https://developer.mozilla.org/" target="_blank" rel="noreferrer">
                  MDN Web Docs ↗
                </a>
                <a href="https://git-scm.com/doc" target="_blank" rel="noreferrer">
                  Git Documentation ↗
                </a>
                <a href="https://github.com/" target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                <a href="https://leetcode.com/" target="_blank" rel="noreferrer">
                  LeetCode ↗
                </a>
                <a href="https://www.geeksforgeeks.org/" target="_blank" rel="noreferrer">
                  GeeksforGeeks ↗
                </a>
              </nav>
            </div>

            {/* Contact */}
            <div className={styles.footerColumn}>
              <h3>Connect With Us</h3>

              <div className={styles.footerContact}>
                <span className={styles.footerLabel}>OFFICIAL EMAIL</span>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=enigma.nielit@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  enigma.nielit@gmail.com ↗
                </a>
              </div>

              <div className={styles.footerContact}>
                <span className={styles.footerLabel}>COMMUNITY / GROUP ID</span>
                <p>YOUR_OFFICIAL_GROUP_ID</p>
              </div>

              <div className={styles.footerContact}>
                <span className={styles.footerLabel}>FIND US ONLINE</span>
                <a
                  href="https://www.linkedin.com/company/enigma-nielit/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
                </a>
                <a
                  href="YOUR_GITHUB_ORGANIZATION_URL"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
                <a
                  href="YOUR_INSTAGRAM_PAGE_URL"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram ↗
                </a>
              </div>
            </div>
          </div>

          {/* Club information strip */}
          <div className={styles.footerInfo}>
            <div>
              <span className={styles.footerInfoDot} />
              <span>Community-driven learning</span>
            </div>
            <div>
              <span>Built for curious minds.</span>
            </div>
            <div>
              <span>NIELIT Chhatrapati Sambhajinagar</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className={styles.footerBottom}>
            <p>
              © <CurrentYear /> ENIGMA Coding Club. All rights reserved.
            </p>

            <nav aria-label="Legal and footer navigation">
              <a href="#about">About</a>
              <Link href="/membership">Join ENIGMA</Link>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=enigma.nielit@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact ENIGMA
              </a>
            </nav>

            <a href="#top" className={styles.backToTop}>
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
