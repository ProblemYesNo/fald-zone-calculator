'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { calculateZones, type ZoneCalculation } from '@/lib/fald';
import styles from './zone-calculator.module.scss';

type PreviewScale = 'fit' | '1' | '2' | '4' | '8' | '16';
const initialDisplay = { diagonalInches: 27, widthPixels: 3840, heightPixels: 2160, zones: 576 };

export default function ZoneCalculator() {
  const [screenSize, setScreenSize] = useState('27');
  const [resolutionWidth, setResolutionWidth] = useState('3840');
  const [resolutionHeight, setResolutionHeight] = useState('2160');
  const [numZones, setNumZones] = useState('576');
  const [scale, setScale] = useState<PreviewScale>('4');
  const [result, setResult] = useState<ZoneCalculation | null>(() => calculateZones(initialDisplay));
  const [error, setError] = useState('');
  const [fullscreenError, setFullscreenError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pixelRatio, setPixelRatio] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const previousScale = useRef<PreviewScale>('4');
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  const patternId = useId();

  useEffect(() => {
    const updateRatio = () => setPixelRatio(window.devicePixelRatio || 1);
    const updateFullscreen = () => {
      const active = document.fullscreenElement === previewRef.current;
      setIsFullscreen(active);
      if (!active) {
        setScale(previousScale.current);
        fullscreenButton.current?.focus();
      }
    };
    updateRatio();
    window.addEventListener('resize', updateRatio);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => {
      window.removeEventListener('resize', updateRatio);
      document.removeEventListener('fullscreenchange', updateFullscreen);
    };
  }, []);

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setResult(calculateZones({
        diagonalInches: Number(screenSize), widthPixels: Number(resolutionWidth),
        heightPixels: Number(resolutionHeight), zones: Number(numZones),
      }));
      setError('');
    } catch (error) {
      setResult(null);
      setError(error instanceof Error ? error.message : 'Please enter valid display dimensions.');
    }
  }

  async function toggleFullscreen() {
    setFullscreenError('');
    try {
      if (document.fullscreenElement === previewRef.current) {
        await document.exitFullscreen();
      } else if (previewRef.current?.requestFullscreen) {
        previousScale.current = scale;
        await previewRef.current.requestFullscreen();
        setScale('fit');
        previewRef.current.querySelector<HTMLElement>('[tabindex]')?.focus();
      } else {
        setFullscreenError('Fullscreen is unavailable in this browser. Use 1:1 or your browser’s fullscreen mode instead.');
      }
    } catch {
      setFullscreenError('The browser could not open fullscreen. Use 1:1 or your browser’s fullscreen mode instead.');
    }
  }

  // At 1:1 compensate for display scaling: one source pixel per device pixel at the current browser zoom.
  const scaleDivisor = scale === 'fit' ? 1 : Number(scale) * (scale === '1' ? pixelRatio : 1);

  return (
    <div className={styles.container}>
      <section className={styles.intro} aria-label="Display calculator">
        <p className={styles.eyebrow}>A closer look at local dimming</p>
        <h2>Every zone. <span>In perspective.</span></h2>
        <p>Enter your display’s specs to see how its backlight is divided.</p>
      </section>
      <form className={styles.form} onSubmit={calculate}>
        <div className={styles.inputGroup}>
          <span className={styles.fieldLabel}>Resolution</span>
          <div className={styles.resolution}>
            <input aria-label="Resolution width in pixels" type="number" value={resolutionWidth}
              onChange={event => setResolutionWidth(event.target.value)} step="1" min="1" required />
            <span aria-hidden="true">×</span>
            <input aria-label="Resolution height in pixels" type="number" value={resolutionHeight}
              onChange={event => setResolutionHeight(event.target.value)} step="1" min="1" required />
          </div>
          <small>pixels</small>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel} htmlFor="screenSize">Diagonal</label>
          <div className={styles.withUnit}>
            <input type="number" id="screenSize" value={screenSize}
              onChange={event => setScreenSize(event.target.value)} step="any" min="0.1" required list="screenSizes" />
            <span aria-hidden="true">″</span>
          </div>
          <small>inches</small>
          <datalist id="screenSizes">
            {[13.3, 15.6, 21.5, 23.8, 27, 32, 55, 65].map(size => <option key={size} value={size} />)}
          </datalist>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel} htmlFor="numZones">Dimming zones</label>
          <input type="number" id="numZones" value={numZones}
            onChange={event => setNumZones(event.target.value)} step="1" min="1" required />
          <small>total backlight zones</small>
        </div>
        <button className={styles.calculateButton} type="submit">Calculate <span aria-hidden="true">↗</span></button>
      </form>
      <div aria-live="polite">
        {error && <p className={styles.error} role="alert">{error}</p>}
        {result && (
          <section className={styles.results} aria-label="Calculation results">
            <div className={styles.primaryResult}>
              <p className={styles.eyebrow}>Estimated size of one zone</p>
              <p className={styles.bigNumber}>{result.zoneWidthPixels.toFixed(1)} <span>×</span> {result.zoneHeightPixels.toFixed(1)} <small>px</small></p>
              <p className={styles.physicalSize}>{result.zoneWidthInches.toFixed(2)} × {result.zoneHeightInches.toFixed(2)} inches</p>
            </div>
            <dl className={styles.stats}>
              <div><dt>Grid arrangement</dt><dd>{result.columns} × {result.rows}<small>columns × rows</small></dd></div>
              <div><dt>Total zones</dt><dd>{result.zones.toLocaleString('en-US')}<small>individual regions</small></dd></div>
              <div><dt>Screen dimensions</dt><dd>{result.screenWidthInches.toFixed(2)} × {result.screenHeightInches.toFixed(2)}<small>inches · width × height</small></dd></div>
            </dl>
          </section>
        )}
      </div>
      {result && (
        <section className={styles.previewSection} aria-label="Zone visualization">
          <div className={styles.sectionHeading}><h3>Your display, divided.</h3><span>{result.widthPixels} × {result.heightPixels} px</span></div>
          <div className={styles.preview} ref={previewRef}>
            <div className={styles.toolbar}>
              <span className={styles.previewLabel}><span aria-hidden="true">▦</span> Zone map</span>
              <div className={styles.controls}>
                <label htmlFor="previewScale">Scale</label>
                <select id="previewScale" value={scale} onChange={event => setScale(event.target.value as PreviewScale)}>
                  <option value="fit">Fit to view</option>
                  {['1', '2', '4', '8', '16'].map(value => <option key={value} value={value}>1:{value}{value === '1' ? ' · native pixels' : ''}</option>)}
                </select>
                <button ref={fullscreenButton} type="button" onClick={toggleFullscreen}>
                  <span aria-hidden="true">{isFullscreen ? '↙' : '⛶'}</span> {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                </button>
              </div>
            </div>
            <div className={`${styles.viewport} ${scale === 'fit' ? styles.fit : styles.actualSize}`} tabIndex={0}
              role="region" aria-label="Zone map; scroll to explore when larger than the view">
              <svg className={styles.visualizationGrid} role="img"
                aria-label={`Estimated ${result.columns} by ${result.rows} grid of ${result.zones} FALD zones`}
                viewBox={`0 0 ${result.widthPixels} ${result.heightPixels}`}
                width={result.widthPixels / scaleDivisor} height={result.heightPixels / scaleDivisor}>
                <defs>
                  <pattern id={patternId} width={result.zoneWidthPixels} height={result.zoneHeightPixels} patternUnits="userSpaceOnUse">
                    <rect width={result.zoneWidthPixels} height={result.zoneHeightPixels} fill="#262626" />
                    <path d={`M ${result.zoneWidthPixels} 0 H 0 V ${result.zoneHeightPixels}`}
                      fill="none" stroke="#b3b3b3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  </pattern>
                </defs>
                <rect width={result.widthPixels} height={result.heightPixels} fill={`url(#${patternId})`} />
                <rect width={result.widthPixels} height={result.heightPixels} fill="none" stroke="#b3b3b3"
                  strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className={styles.previewCaption}>
              <span>{scale === 'fit' ? 'Entire display fitted to the view' : scale === '1'
                ? '1 source pixel per device pixel · scroll to explore'
                : `1:${scale} source-pixel scale · scroll to explore`}</span>
              <span>{isFullscreen ? 'Press Esc to exit' : `${result.zones.toLocaleString('en-US')} zones`}</span>
            </div>
            {fullscreenError && <p className={styles.fullscreenError} role="alert">{fullscreenError}</p>}
          </div>
          <p className={styles.note}>An estimated uniform grid, assuming square pixels. Actual layouts vary by manufacturer.
            {' '}Native pixels follow your current browser zoom and display scaling; this is not a physical-size calibration.</p>
        </section>
      )}
      <details className={styles.explainer}>
        <summary>What does this preview tell me?</summary>
        <p>Each rectangle represents one independently controlled backlight zone. Fewer, larger zones cover more pixels together;
          more, smaller zones allow finer local control. This map shows zone geometry, not a simulation of contrast, blooming, or haloing.</p>
      </details>
    </div>
  );
}
