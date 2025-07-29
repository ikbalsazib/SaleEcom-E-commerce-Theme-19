import { animate, keyframes, style, transition, trigger } from '@angular/animations';

export const popupAnimations = [
  trigger('popupAnimation', [
    // Enter Animation
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0)' }),
      animate(
        '450ms ease-out',
        keyframes([
          style({ offset: 0, opacity: 0, transform: 'scale(0)' }),
          style({ offset: 1, opacity: 0.99, transform: 'scale(1)' }),
        ])
      ),
    ]),

    // Leave Animation
    transition(':leave', [
      animate(
        '450ms ease-in',
        keyframes([
          style({ offset: 0, opacity: 0.99, transform: 'scale(1)' }),
          style({ offset: 1, opacity: 0, transform: 'scale(0)' }),
        ])
      ),
    ]),
  ]),
];
