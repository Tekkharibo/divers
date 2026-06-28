#!/usr/bin/env bash
# download_sleep.sh — Télécharge Max Richter «Sleep», fusionne les parties, tag MP3
#
# Dépendances : yt-dlp, ffmpeg
# Usage       : ./download_sleep.sh [dossier_de_sortie]
#               Dossier par défaut : ./Sleep_MaxRichter

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────

PLAYLIST_URL="https://youtube.com/playlist?list=OLAK5uy_my04DUoWmrxtfRTWXSRCwbxhpOi6IoVNs"
OUTPUT_DIR="${1:-./Sleep_MaxRichter}"
DOWNLOAD_DIR="$OUTPUT_DIR/parts"
FINAL_DIR="$OUTPUT_DIR/final"

# Métadonnées
ARTIST="Max Richter"
ALBUM="Sleep"
YEAR="2015"
GENRE="Neoclassical"
ALBUM_ARTIST="Max Richter"
COMMENT="Deutsche Grammophon (2015). Concept album on the neuroscience of sleep; a full-night lullaby of 8h24."

# ── Vérification des dépendances ─────────────────────────────────────────────

for cmd in yt-dlp ffmpeg realpath; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "Erreur : '$cmd' est introuvable. Installe-le avant de relancer le script." >&2
        exit 1
    fi
done

mkdir -p "$DOWNLOAD_DIR" "$FINAL_DIR"

# ── 1. Téléchargement ────────────────────────────────────────────────────────

echo "==> Téléchargement de la playlist en MP3…"
echo "    Destination : $DOWNLOAD_DIR"
echo ""

yt-dlp \
    --extract-audio \
    --audio-format mp3 \
    --audio-quality 0 \
    --no-overwrites \
    --output "$DOWNLOAD_DIR/%(playlist_index)03d - %(title)s.%(ext)s" \
    "$PLAYLIST_URL"

# ── 2. Parsing des fichiers téléchargés ──────────────────────────────────────

echo ""
echo "==> Analyse et regroupement des parties…"

tmp_list=$(mktemp)
trap 'rm -f "$tmp_list"' EXIT

for f in "$DOWNLOAD_DIR"/*.mp3; do
    [[ -f "$f" ]] || continue
    fname=$(basename "$f" .mp3)

    # Index de la playlist (chiffres en tête, ex: "007")
    idx=$(echo "$fname" | grep -oP '^\d+')

    # Titre brut = tout ce qui suit "NNN - "
    title="${fname#*- }"

    # Supprimer le préfixe "Richter: " s'il est présent
    title="${title#Richter: }"

    # Supprimer le suffixe " (Pt. N)"
    base=$(echo "$title" | sed -E 's/ \(Pt\. [0-9]+\)//')

    # Trim des espaces en début et fin
    base="$(echo "$base" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')"

    # Ligne : index TAB nom_de_base TAB chemin_absolu
    printf '%s\t%s\t%s\n' "$idx" "$base" "$(realpath "$f")" >> "$tmp_list"
done

# Tri par index de playlist
sort -t$'\t' -k1 -n "$tmp_list" -o "$tmp_list"

# Noms de base uniques, dans leur ordre d'apparition
mapfile -t ordered_bases < <(cut -f2 "$tmp_list" | awk '!seen[$0]++')
total=${#ordered_bases[@]}

if [[ $total -eq 0 ]]; then
    echo "Erreur : aucun fichier MP3 trouvé dans $DOWNLOAD_DIR" >&2
    exit 1
fi

echo "    ${total} piste(s) finale(s) détectée(s)."

# ── 3. Fusion des parties et tagging ─────────────────────────────────────────

echo ""
echo "==> Fusion et ajout des métadonnées…"
echo ""

track_num=1
for base in "${ordered_bases[@]}"; do

    # Chemins des fichiers pour ce nom de base, dans l'ordre de la playlist
    mapfile -t parts < <(
        grep -F $'\t'"${base}"$'\t' "$tmp_list" \
        | sort -t$'\t' -k1 -n \
        | cut -f3
    )

    track_fmt=$(printf "%02d" "$track_num")
    out_file="$FINAL_DIR/${track_fmt} - ${base}.mp3"

    # Tableau des options de métadonnées ffmpeg
    ffmpeg_meta=(
        -metadata title="$base"
        -metadata artist="$ARTIST"
        -metadata album="$ALBUM"
        -metadata album_artist="$ALBUM_ARTIST"
        -metadata date="$YEAR"
        -metadata genre="$GENRE"
        -metadata track="${track_num}/${total}"
        -metadata comment="$COMMENT"
    )

    if [[ ${#parts[@]} -eq 1 ]]; then
        printf '  [%s/%02d] %s\n' "$track_fmt" "$total" "$base"
        ffmpeg -loglevel warning -y \
            -i "${parts[0]}" \
            "${ffmpeg_meta[@]}" \
            -codec:a libmp3lame -q:a 0 \
            "$out_file"
    else
        printf '  [%s/%02d] %s  ← %d parties fusionnées\n' \
            "$track_fmt" "$total" "$base" "${#parts[@]}"

        # Fichier de liste pour le démuxeur concat de ffmpeg
        concat_tmp=$(mktemp --suffix=.txt)
        for p in "${parts[@]}"; do
            # Échappement des guillemets doubles dans le chemin
            p_esc="${p//\"/\\\"}"
            printf 'file "%s"\n' "$p_esc" >> "$concat_tmp"
        done

        ffmpeg -loglevel warning -y \
            -f concat -safe 0 \
            -i "$concat_tmp" \
            "${ffmpeg_meta[@]}" \
            -codec:a libmp3lame -q:a 0 \
            "$out_file"

        rm "$concat_tmp"
    fi

    track_num=$((track_num + 1))
done

# ── 4. Résumé ────────────────────────────────────────────────────────────────

echo ""
echo "==> Terminé !"
printf '    %d piste(s) dans : %s\n' "$total" "$FINAL_DIR"
echo "    Fichiers sources (parties brutes) : $DOWNLOAD_DIR"
echo "    Tu peux supprimer $DOWNLOAD_DIR si tu n'en as plus besoin."
