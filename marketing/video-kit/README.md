# Remotion Video Kit

ボイス見積の営業動画をCodexで量産するためのRemotion制作キットです。

## 使い方

```powershell
npm.cmd install
npm.cmd run render:lp
```

出力先:

```text
C:\mitsumori_project\web\public\videos\voice-estimate-short.mp4
```

## 方針

- 15秒、30秒、60秒の動画をテンプレ化する
- 台本と字幕はReactコンポーネント内で管理する
- ナレーションは `public/narration.mp3` を使う
- 書き出し後、LPの動画ファイルへ直接反映する
