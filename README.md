TaskGlitch Bug Fixes
This document details the 5 critical bugs identified in the project and the steps taken to resolve them, restoring stability, performance, and correctness to the application.

1. BUG 1️: Double Fetch Issue

File Affected: src/hooks/useTasks.ts

Problem: On page load, all tasks were duplicated. This was caused by two separate useEffect hooks both fetching /tasks.json. The second (buggy) hook appended its results to the already-loaded task list.

Fix: The entire second useEffect block (lines 100-114), which was injected as a bug, was removed. This ensures the data is fetched only once.

2. BUG 2️: Undo Snackbar Bug

Files Affected: src/hooks/useTasks.ts,
src/context/TasksContext.tsx,
src/App.tsx

Problem: When a task was deleted, the "Undo" snackbar appeared. If the user let the snackbar time out (or clicked away) instead of clicking "Undo," the lastDeleted task state was not cleared. This caused subsequent "Undo" clicks to restore the wrong task. The onClose handler for the snackbar was empty.

Fix:

A new function, clearLastDeleted, was added to useTasks.ts to set the lastDeleted state back to null.

This function was passed through the TasksContext.

The handleCloseUndo function in App.tsx was updated to call clearLastDeleted. This function is now correctly triggered by the UndoSnackbar's onClose prop.

3. BUG 3️: Unstable Sorting

File Affected: src/utils/logic.ts

Problem: When tasks had the same ROI and priority, the sortTasks function used Math.random() as a tie-breaker. This caused the task list to flicker and randomly re-order on every re-render.

Fix: The random tie-breaker was replaced with a stable, deterministic one: a.title.localeCompare(b.title). Tasks with the same ROI and priority are now always sorted alphabetically by title, eliminating the flicker.

4. BUG 4️: Double Dialog Opening

File Affected: src/components/TaskTable.tsx

Problem: Clicking the "Edit" or "Delete" icons in the task table opened both the correct (Edit/Delete) dialog and the "View Details" dialog. This happened because the click event was bubbling up from the icon button to the parent TableRow.

Fix: event.stopPropagation() was added to the onClick handlers for both the "Edit" and "Delete" icon buttons. This stops the event from bubbling, so only the intended dialog opens.

5. BUG 5️: ROI Errors (Calculation & Validation)

Files Affected: src/utils/logic.ts, src/components/ChartsDashboard.tsx

Problem: The computeROI function performed unsafe division (revenue / timeTaken). When timeTaken was 0 or negative (due to buggy injected data), this resulted in Infinity or NaN, breaking the UI and charts.

Fix:

The computeROI function in logic.ts was rewritten to be "safe." It now validates that revenue and timeTaken are finite numbers and that timeTaken is greater than 0. If validation fails, it returns null.

The TaskTable.tsx component already handles null by displaying "N/A", which now works correctly.

The "ROI Distribution" chart in ChartsDashboard.tsx was updated to explicitly check for t.roi === null and place those tasks in the "N/A" bucket, preventing them from being miscategorized.

Some Other bug that i have try to fix it 

CSV Export

File Affected: src/utils/csv.ts

Problem 1 (Headers): The CSV headers were generated from the keys of the first task (Object.keys(tasks[0])). This was unstable and would omit columns if the first task was missing data (e.g., notes).

Fix 1: Replaced the dynamic logic with a static, hard-coded headers array. This ensures all headers are always present and in the correct order.

Problem 2 (Escaping): The escapeCsv function only checked for newline characters (\n). It failed to escape commas or double-quotes, which would corrupt the CSV file structure.

Fix 2: The escapeCsv function was rewritten to be RFC 4180 compliant. It now correctly wraps any field containing a comma, newline, or double-quote in "" and escapes any internal double-quotes by doubling them (" -> "").