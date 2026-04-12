import { insertAfter } from '../helpers/insertHelpers';
import { render } from 'preact';
import React from 'preact/compat';
import NotificationPopup from '../components/NotificationPopup/NotificationPopup';

export default class DisplayManager {
  constructor() {
    this.notifications = [];
    this.settings = {};
    // Persist index across pages so notifications rotate (don't repeat from 0 each visit)
    this.currentIndex = parseInt(sessionStorage.getItem('avada_sp_currentIndex') || '0', 10);
    // Reset count per page load — maxPopsDisplay applies per page visit, not per session
    this.displayCount = 0;
  }

  async initialize({ notifications, settings }) {
    this.notifications = notifications || [];
    this.settings = settings || {};

    if (this.notifications.length === 0) return;
    if (!this.shouldShowPopup()) return;

    this.insertContainer();

    // Start the display loop after firstDelay
    const firstDelayMs = (this.settings.firstDelay || 1) * 1000;
    setTimeout(() => {
      this.displayLoop();
    }, firstDelayMs);
  }

  shouldShowPopup() {
    const { allowShow, includedUrls, excludedUrls } = this.settings;
    const currentPath = window.location.pathname;

    if (allowShow === 'specific') {
      const included = (includedUrls || '').split('\n').map(l => l.trim()).filter(Boolean);
      return included.length === 0 || included.includes(currentPath);
    } else {
      // allowShow === 'all'
      const excluded = (excludedUrls || '').split('\n').map(l => l.trim()).filter(Boolean);
      return !excluded.includes(currentPath);
    }
  }

  displayLoop = async () => {
    const { maxPopsDisplay, displayDuration, popsInterval } = this.settings;

    if (this.currentIndex >= this.notifications.length) {
      this.currentIndex = 0; // Loop back to the first notification if we run out
    }

    const notification = this.notifications[this.currentIndex];

    // Display the current notification
    console.log('Rendering notification:', notification, 'at index:', this.currentIndex);
    this.display({ notification });

    // Update and persist state
    this.displayCount++;
    this.currentIndex++;
    sessionStorage.setItem('avada_sp_displayCount', this.displayCount.toString());
    sessionStorage.setItem('avada_sp_currentIndex', this.currentIndex.toString());

    // Fade out after displayDuration
    const displayDurationMs = (displayDuration || 3) * 1000;
    setTimeout(() => {
      this.fadeOut();

      // Show next notification after popsInterval
      const popsIntervalMs = (popsInterval || 2) * 1000;
      setTimeout(() => {
        this.displayLoop();
      }, popsIntervalMs);

    }, displayDurationMs);
  }

  fadeOut() {
    const container = document.querySelector('#Avada-SalePop');
    if (container) {
      render(null, container); // Unmount Preact component
    }
  }

  display({ notification }) {
    const container = document.querySelector('#Avada-SalePop');
    if (container) {
      render(
        <NotificationPopup
          {...notification}
          settings={this.settings}
          relativeDate="a few seconds ago"
        />,
        container
      );
    }
  }

  insertContainer() {
    const popupEl = document.createElement('div');
    popupEl.id = `Avada-SalePop`;
    popupEl.classList.add('Avada-SalePop__OuterWrapper');
    const targetEl = document.querySelector('body');
    if (targetEl) {
      targetEl.appendChild(popupEl);
    }

    return popupEl;
  }
}
