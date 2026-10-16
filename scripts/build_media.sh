#!/usr/bin/env bash
# Build web media for the XRT site from the final ICRA video package (read-only inputs).
# Output: site/assets/video/*.mp4 (+ .jpg posters). Re-run safely; outputs are overwritten.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=../video_submission_final
FULL=$SRC/exports/XRT_ICRA_2027_Submission.mp4
OUT=site/assets/video
mkdir -p "$OUT"
FF="ffmpeg -v error -y -threads 4"
VENC="-c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart"

seg() {  # name start end audio(0/1)
  local a="-an"; [ "$4" = 1 ] && a="-c:a aac -b:a 128k"
  $FF -ss "$2" -to "$3" -i "$FULL" -vf "scale=1280:-2" $VENC $a "$OUT/$1.mp4"
  $FF -ss 1 -i "$OUT/$1.mp4" -frames:v 1 -q:v 4 "$OUT/$1.jpg"
}
raw() {  # name source
  $FF -i "$2" -vf "scale='min(1280,iw)':-2" $VENC -an "$OUT/$1.mp4"
  $FF -ss 1 -i "$OUT/$1.mp4" -frames:v 1 -q:v 4 "$OUT/$1.jpg"
}

# Segments of the finished video (timeline: video_submission_final/provenance/production_history.md)
seg architecture        12 21  0
seg feedback_sweep      33 51  1
seg feedback_recorded   51 66  1
seg four_conditions     66 72  0
seg flip_over_twin      72 82  0
seg flip_back_twin      82 103 0
seg twin_sync           103 111 0
seg learning_dyad7      111 126 0
seg learning_dyad1      126 137 0
seg results             137 155 0

# Raw, silent source clips
A=$SRC/assets
raw operators_opening   $A/01_hook_operators.mp4
raw operators_demo      $A/02_operator_demo.mp4
raw operators_closing   $A/11_closing_operators.mp4
raw operators_staged    $A/originals/XRT-Robots+Operators.mov   # full staged two-operator take (ICRA video opening/closing source)
raw robot_pov_flip      $A/05_feedback_P01_flip_POV.mp4
raw cond_V              $A/03_grid_V.mp4
raw cond_AV             $A/03_grid_AV.mp4
raw cond_TV             $A/03_grid_HV.mp4
raw cond_TAV            $A/03_grid_HAV.mp4
raw twin_wide           $A/P05_HV_attempt2_twin_sync_wide.mp4

# Full video, as submitted (H.264/AAC, 720p, fast-start)
cp "$FULL" "$OUT/XRT_full_video.mp4"
$FF -ss 2 -i "$FULL" -frames:v 1 -q:v 3 "$OUT/XRT_full_video.jpg"
du -ch "$OUT"/*.mp4 | tail -1
