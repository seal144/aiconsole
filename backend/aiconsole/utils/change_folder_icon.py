# from importlib import resources
# from pathlib import Path
# from platform import system


# def change_aiconsole_folder_icon(folder_path: Path):
#     if system() == "Darwin":
#         _change_macos_aiconsole_folder_icon(folder_path)
#     else:
#         pass


# def _change_macos_aiconsole_folder_icon(folder_path: Path):
#     import Cocoa

#     with resources.path("aiconsole.utils", "electron.icns") as asset_path:
#         Cocoa.NSWorkspace.sharedWorkspace().setIcon_forFile_options_(  # type: ignore
#             Cocoa.NSImage.alloc().initWithContentsOfFile_(str(asset_path)), str(folder_path), 0  # type: ignore
#         )
