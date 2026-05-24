const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
const IMDB_ID = 'tt33253070';

const episodes = {
  1: 'M I A S01E01 Revenge 1080p AMZN WEB-DL DDP5 1 Atmos H 264-FLUX.ro.srt',
  2: 'M I A S01E02 Orphans 2160p PCOK WEB-DL DDP5 1 Atmos DV HDR H 265-FLUX.ro.srt',
  3: 'M I A S01E03 American Immigrant 1080p AMZN WEB-DL DDP5 1 Atmos H 264-FLUX.ro.srt',
  4: 'M I A S01E04 Cant Hardly Carlito 2160p PCOK WEB-DL DDP5 1 Atmos DV HDR H 265-FLUX.ro.srt',
  5: 'M I A S01E05 Fault Lines 2160p PCOK WEB-DL DDP5 1 Atmos DV HDR H 265-FLUX.ro.srt',
  6: 'M I A S01E06 Original Sin 1080p AMZN WEB-DL DDP5 1 Atmos H 264-FLUX.ro.srt',
  7: 'M I A S01E07 Hammer Drop 1080p AMZN WEB-DL DDP5 1 Atmos H 264-FLUX.ro.srt',
  8: 'M I A S01E08 Heart Matters 1080p AMZN WEB-DL DDP5 1 Atmos H 264-FLUX.ro.srt',
  9: 'M I A S01E09 Aperture 1080p AMZN WEB-DL DDP5 1 Atmos H 264-FLUX.ro.srt'
};

function baseUrl(req) {
  return PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
}

function manifest(req) {
  return {
    id: 'ro.mia.static.subtitles',
    version: '1.0.0',
    name: 'M.I.A. RO Subtitrări',
    description: 'Subtitrări în română pentru M.I.A. S01 (tt33253070)',
    resources: ['subtitles'],
    types: ['series'],
    idPrefixes: ['tt'],
    catalogs: [],
    logo: `${baseUrl(req)}/logo.png`
  };
}

app.get('/', (req, res) => {
  res.type('text').send(`M.I.A. RO Stremio Addon OK. Install: ${baseUrl(req)}/manifest.json`);
});

app.get('/manifest.json', (req, res) => {
  res.json(manifest(req));
});

app.get('/subtitles/series/:id.json', (req, res) => {
  // Stremio format: tt33253070:1:1
  const raw = req.params.id;
  const [imdb, season, episode] = raw.split(':');
  const ep = Number(episode);

  if (imdb !== IMDB_ID || String(season) !== '1' || !episodes[ep]) {
    return res.json({ subtitles: [] });
  }

  const file = episodes[ep];
  const url = `${baseUrl(req)}/srt/${encodeURIComponent(file)}`;

  res.json({
    subtitles: [{
      id: `mia-s01e${String(ep).padStart(2, '0')}-ro`,
      url,
      lang: 'ro',
      name: `Română - M.I.A. S01E${String(ep).padStart(2, '0')} - RegieLive/Local`
    }]
  });
});

app.get('/subtitles/movie/:id.json', (req, res) => {
  res.json({ subtitles: [] });
});

app.get('/srt/:file', (req, res) => {
  const file = decodeURIComponent(req.params.file);
  if (!Object.values(episodes).includes(file)) return res.status(404).send('Not found');
  res.setHeader('Content-Type', 'application/x-subrip; charset=utf-8');
  res.sendFile(path.join(__dirname, 'subtitles', file));
});

app.get('/logo.png', (req, res) => res.status(204).end());

app.listen(PORT, () => {
  console.log(`M.I.A. subtitle addon running on port ${PORT}`);
});
