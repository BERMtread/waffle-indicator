import { animate, utils } from 'animejs';

const SYRUP_EASING = 'cubicBezier(0.25, 0.1, 0.25, 1.4)';

/** Viscous number counter for the syrup level display */
export function animateValue(
  el: HTMLElement,
  from: number,
  to: number,
  duration = 800,
  decimals = 1
) {
  const obj = { val: from };
  return animate(obj, {
    val: to,
    duration,
    ease: SYRUP_EASING,
    onUpdate() {
      el.textContent = obj.val.toFixed(decimals);
    },
  });
}

/** Bar fill with syrupy overshoot easing */
export function animateBar(el: HTMLElement, toPct: number, duration = 700) {
  return animate(el, {
    width: `${toPct}%`,
    duration,
    ease: SYRUP_EASING,
  });
}

/** Cascading panel entrance (translateY 6px + fade, staggered 60ms) */
export function staggerPanels(selector: string, delay = 60) {
  return animate(selector, {
    translateY: [6, 0],
    opacity: [0, 1],
    duration: 400,
    ease: 'outCubic',
    delay: utils.stagger(delay),
  });
}
