import asyncio
import logging
import threading
from pathlib import Path
from typing import Callable

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

_log = logging.getLogger(__name__)


class BatchingWatchDogHandler(FileSystemEventHandler):
    def __init__(self, reload, extension=".toml"):
        self.lock = threading.RLock()
        self.timer = None
        self.reload = reload
        self.extension = extension

    def on_moved(self, event):
        return self.on_modified(event)

    def on_created(self, event):
        return self.on_modified(event)

    def on_deleted(self, event):
        return self.on_modified(event)

    def on_modified(self, event):
        if event.is_directory or not event.src_path.endswith(self.extension):
            return

        with self.lock:

            def reload():
                with self.lock:
                    if self.timer is not None:
                        self.timer.cancel()
                    self.timer = None
                    asyncio.run(self.reload())

            if self.timer is None:
                self.timer = threading.Timer(1.0, reload)
                self.timer.start()


class FileObserver:
    def __init__(self):
        self._observer = None
        self.observing: list[Path] = []

    def start(self, file_paths: list[Path], on_changed: Callable):
        _log.debug(f"[{self.__class__.__name__}] Starting observer...")

        # Stop and reset the existing observer
        self.stop()

        # Reinitialize the observer
        self._observer = Observer()
        self._observer.daemon = False

        # Setup and start new observer
        for file_path in file_paths:
            if not isinstance(file_path, Path):
                _log.error(f"[{self.__class__.__name__}] Not a valid filepath: {file_path}")
                continue

            if file_path in self.observing:
                _log.warning(f"[{self.__class__.__name__}] Already observing: {file_path}")
                continue

            # Set up observer
            try:
                self._observer.schedule(
                    BatchingWatchDogHandler(on_changed, file_path.suffix),
                    file_path.parent,
                    recursive=False,
                )
            except Exception as e:
                _log.error(f"[{self.__class__.__name__}] Error setting up observer for {file_path}: {e}")

            self.observing.append(file_path)

        if self.observing:
            try:
                self._observer.start()
                _log.info(f"[{self.__class__.__name__}] Observing for changes: {self.observing}.")
            except RuntimeError as e:
                _log.error(f"[{self.__class__.__name__}] Error starting observer: {e}")

    def stop(self):
        if self._observer:
            if self._observer.is_alive():
                try:
                    self._observer.stop()
                    self._observer.join(timeout=5)
                except Exception as e:
                    _log.error(f"[{self.__class__.__name__}] Error stopping observer: {e}")
                else:
                    _log.info(f"[{self.__class__.__name__}] Observer stopped.")
            else:
                _log.info(f"[{self.__class__.__name__}] Observer was not running.")

            # Clear the observer reference
            self._observer = None
            self.observing.clear()
        else:
            _log.info(f"[{self.__class__.__name__}] Observer was not initialized.")
