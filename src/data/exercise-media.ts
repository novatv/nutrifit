/**
 * Registro de medios por ejercicio.
 *
 * Las fotos y vídeos NO son nuestros: vienen de wger.de (licencia CC-BY-SA),
 * así que cada entrada lleva su autor y su licencia y la app los muestra.
 * Sin atribución visible no se puede usar ese material; no es opcional.
 *
 * Las imágenes se descargan a `assets/exercises/` para que funcionen sin
 * red; los vídeos se enlazan, no se empaquetan (pesan demasiado).
 * Un ejercicio sin entrada aquí muestra su pictograma por patrón.
 */

export type MediaLicense = 'CC-BY-SA-3.0' | 'CC-BY-SA-4.0' | 'CC0' | 'own';

export interface ExerciseMedia {
  /** Imagen local empaquetada. `require()` estático para que Metro la incluya. */
  image?: number;
  /** URL de vídeo de demostración; se abre fuera de la app. */
  videoUrl?: string;
  /** Autor tal como pide la licencia. Vacío solo si la licencia no lo exige. */
  author: string;
  license: MediaLicense;
  /** De dónde salió, para poder revisarlo o retirarlo. */
  sourceUrl: string;
}

/**
 * Clave: slug del ejercicio en la biblioteca (p. ej. 'barbell-back-squat').
 *
 * Generado a partir de la API pública de wger.de (exerciseinfo); el listado
 * completo con autor, licencia y origen está en `docs/MEDIA_ATTRIBUTION.md`.
 * Solo se emparejan ejercicios que en wger son claramente el mismo; el resto
 * no aparece aquí y usa su pictograma.
 */
export const EXERCISE_MEDIA: Record<string, ExerciseMedia> = {
  'barbell-back-squat': {
    image: require('@/assets/exercises/barbell-back-squat.jpg'),
    author: 'Workout Guru',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1801/view/',
  },
  'barbell-front-squat': {
    image: require('@/assets/exercises/barbell-front-squat.png'),
    videoUrl: 'https://wger.de/media/exercise-video/257/ad8ac7d9-b04d-415f-ae0e-837942ce2840.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/257/view/',
  },
  'goblet-squat': {
    image: require('@/assets/exercises/goblet-squat.jpg'),
    author: 'philip',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/203/view/',
  },
  'barbell-box-squat': {
    image: require('@/assets/exercises/barbell-box-squat.png'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/977/view/',
  },
  'leg-press': {
    image: require('@/assets/exercises/leg-press.jpg'),
    videoUrl: 'https://wger.de/media/exercise-video/371/6aae16b4-01b9-4eb4-935c-3250f84d2c59.MOV',
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/371/view/',
  },
  'hack-squat-machine': {
    image: require('@/assets/exercises/hack-squat-machine.png'),
    videoUrl: 'https://wger.de/media/exercise-video/375/effa7a81-dbdd-4014-83ee-ddf0fd835301.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/375/view/',
  },
  'conventional-deadlift': {
    image: require('@/assets/exercises/conventional-deadlift.jpg'),
    author: 'philip',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/184/view/',
  },
  'sumo-deadlift': {
    image: require('@/assets/exercises/sumo-deadlift.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/630/view/',
  },
  'romanian-deadlift': {
    image: require('@/assets/exercises/romanian-deadlift.jpg'),
    videoUrl: 'https://wger.de/media/exercise-video/507/307e7276-a14d-4ea0-b579-f5b0dbc6f5af.MOV',
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/507/view/',
  },
  'dumbbell-romanian-deadlift': {
    image: require('@/assets/exercises/dumbbell-romanian-deadlift.jpg'),
    author: 'AlucardEvil40',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1652/view/',
  },
  'kettlebell-swing': {
    image: require('@/assets/exercises/kettlebell-swing.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/960/view/',
  },
  'barbell-hip-thrust': {
    videoUrl: 'https://wger.de/media/exercise-video/294/45bacf4b-1bb6-4d47-8bd1-9f00eddd4019.MOV',
    author: 'Goulart',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/294/view/',
  },
  'glute-bridge': {
    image: require('@/assets/exercises/glute-bridge.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/265/view/',
  },
  'back-extension': {
    image: require('@/assets/exercises/back-extension.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/301/view/',
  },
  'barbell-bench-press': {
    image: require('@/assets/exercises/barbell-bench-press.png'),
    videoUrl: 'https://wger.de/media/exercise-video/73/2bdb390c-312c-4497-a722-5eed2c823e5a.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/73/view/',
  },
  'incline-barbell-bench-press': {
    image: require('@/assets/exercises/incline-barbell-bench-press.png'),
    videoUrl: 'https://wger.de/media/exercise-video/538/4349a6f6-4cee-4c09-828b-c5e7fc2c1ff1.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/538/view/',
  },
  'dumbbell-bench-press': {
    image: require('@/assets/exercises/dumbbell-bench-press.png'),
    videoUrl: 'https://wger.de/media/exercise-video/75/080c799b-8afd-4130-8d72-9cef0cd79f54.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/75/view/',
  },
  'incline-dumbbell-press': {
    image: require('@/assets/exercises/incline-dumbbell-press.png'),
    videoUrl: 'https://wger.de/media/exercise-video/537/b9c937e9-daeb-42a9-be8e-7a77e368478c.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/537/view/',
  },
  'dumbbell-floor-press': {
    image: require('@/assets/exercises/dumbbell-floor-press.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1084/view/',
  },
  'push-up': {
    image: require('@/assets/exercises/push-up.jpg'),
    author: 'Settebello',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1551/view/',
  },
  'decline-push-up': {
    image: require('@/assets/exercises/decline-push-up.png'),
    author: 'anon1337',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1112/view/',
  },
  'diamond-push-up': {
    image: require('@/assets/exercises/diamond-push-up.jpg'),
    author: 'philip',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1086/view/',
  },
  'machine-chest-press': {
    image: require('@/assets/exercises/machine-chest-press.jpg'),
    author: 'roneydya',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/129/view/',
  },
  'bench-dip': {
    image: require('@/assets/exercises/bench-dip.png'),
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/197/view/',
  },
  'parallel-bar-dip': {
    image: require('@/assets/exercises/parallel-bar-dip.png'),
    videoUrl: 'https://wger.de/media/exercise-video/194/d039ec90-474d-47a9-a3ad-bf0b00828c82.MP4',
    author: 'cshep442',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/194/view/',
  },
  'barbell-overhead-press': {
    image: require('@/assets/exercises/barbell-overhead-press.jpg'),
    author: 'nishant0712',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1893/view/',
  },
  'seated-dumbbell-shoulder-press': {
    image: require('@/assets/exercises/seated-dumbbell-shoulder-press.png'),
    videoUrl: 'https://wger.de/media/exercise-video/567/64f33c19-1d96-4b7c-af17-6c6a4941c614.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/567/view/',
  },
  'pike-push-up': {
    image: require('@/assets/exercises/pike-push-up.png'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/454/view/',
  },
  'wall-handstand-push-up': {
    image: require('@/assets/exercises/wall-handstand-push-up.png'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/282/view/',
  },
  'machine-shoulder-press': {
    image: require('@/assets/exercises/machine-shoulder-press.png'),
    videoUrl: 'https://wger.de/media/exercise-video/543/dbfd396b-1aab-4a64-a50b-2c31ff0a2cf7.MOV',
    author: 'wger.de',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/543/view/',
  },
  'barbell-bent-over-row': {
    image: require('@/assets/exercises/barbell-bent-over-row.png'),
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/83/view/',
  },
  't-bar-row': {
    image: require('@/assets/exercises/t-bar-row.png'),
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/513/view/',
  },
  'dumbbell-one-arm-row': {
    image: require('@/assets/exercises/dumbbell-one-arm-row.jpg'),
    author: 'Franpol',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/81/view/',
  },
  'chest-supported-dumbbell-row': {
    image: require('@/assets/exercises/chest-supported-dumbbell-row.jpg'),
    author: 'carlos3c',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1283/view/',
  },
  'inverted-row': {
    image: require('@/assets/exercises/inverted-row.jpg'),
    author: 'Gavru',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1198/view/',
  },
  'seated-cable-row': {
    image: require('@/assets/exercises/seated-cable-row.jpg'),
    author: 'Franpol',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1117/view/',
  },
  'machine-seated-row': {
    image: require('@/assets/exercises/machine-seated-row.png'),
    author: 'barry',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1725/view/',
  },
  'cable-face-pull': {
    videoUrl: 'https://wger.de/media/exercise-video/222/245a824b-cd39-45f2-b251-2c0b7efead0d.MOV',
    author: 'Goulart',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/222/view/',
  },
  'band-face-pull': {
    image: require('@/assets/exercises/band-face-pull.jpg'),
    author: '54str',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1732/view/',
  },
  'pull-up': {
    image: require('@/assets/exercises/pull-up.jpg'),
    videoUrl: 'https://wger.de/media/exercise-video/475/83067ffe-ccb9-4e22-8507-5131b211ce74.MOV',
    author: 'Imobard',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/475/view/',
  },
  'chin-up': {
    image: require('@/assets/exercises/chin-up.png'),
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/152/view/',
  },
  'assisted-pull-up-machine': {
    videoUrl: 'https://wger.de/media/exercise-video/477/2e23bb52-2782-40c8-bf88-fa2d2e2a9a0d.MOV',
    author: 'Goulart',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/477/view/',
  },
  'straight-arm-pulldown': {
    image: require('@/assets/exercises/straight-arm-pulldown.png'),
    author: 'barry',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1726/view/',
  },
  'reverse-lunge': {
    image: require('@/assets/exercises/reverse-lunge.jpg'),
    author: 'philip',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/999/view/',
  },
  'bulgarian-split-squat': {
    image: require('@/assets/exercises/bulgarian-split-squat.jpg'),
    author: 'Franpol',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/988/view/',
  },
  'step-up': {
    image: require('@/assets/exercises/step-up.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/981/view/',
  },
  'dumbbell-walking-lunge': {
    image: require('@/assets/exercises/dumbbell-walking-lunge.png'),
    videoUrl: 'https://wger.de/media/exercise-video/206/47a65c45-6fd1-4181-b71a-3a6c882e516b.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/206/view/',
  },
  'dumbbell-bulgarian-split-squat': {
    image: require('@/assets/exercises/dumbbell-bulgarian-split-squat.jpg'),
    author: 'AlucardEvil40',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1706/view/',
  },
  'barbell-lunge': {
    videoUrl: 'https://wger.de/media/exercise-video/46/200d9889-322f-476a-a47b-f15a1a97934a.MOV',
    author: 'Goulart',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/46/view/',
  },
  'plank': {
    image: require('@/assets/exercises/plank.png'),
    author: 'utkb',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/458/view/',
  },
  'bird-dog': {
    image: require('@/assets/exercises/bird-dog.jpg'),
    author: 'Settebello',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1572/view/',
  },
  'hollow-hold': {
    image: require('@/assets/exercises/hollow-hold.png'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/297/view/',
  },
  'lying-leg-raise': {
    image: require('@/assets/exercises/lying-leg-raise.png'),
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/377/view/',
  },
  'hanging-knee-raise': {
    image: require('@/assets/exercises/hanging-knee-raise.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/978/view/',
  },
  'russian-twist': {
    image: require('@/assets/exercises/russian-twist.png'),
    author: 'lion',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1193/view/',
  },
  'pallof-press-cable': {
    image: require('@/assets/exercises/pallof-press-cable.png'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1194/view/',
  },
  'dumbbell-biceps-curl': {
    image: require('@/assets/exercises/dumbbell-biceps-curl.png'),
    videoUrl: 'https://wger.de/media/exercise-video/92/8bfb917c-3d0d-49b9-8073-5d7e01c1b894.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/92/view/',
  },
  'barbell-biceps-curl': {
    image: require('@/assets/exercises/barbell-biceps-curl.png'),
    videoUrl: 'https://wger.de/media/exercise-video/91/483f4bff-e108-41f1-8e7b-0caf24952552.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/91/view/',
  },
  'hammer-curl': {
    image: require('@/assets/exercises/hammer-curl.png'),
    videoUrl: 'https://wger.de/media/exercise-video/272/df069052-2173-4f24-855f-a0eebe729f24.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/272/view/',
  },
  'cable-biceps-curl': {
    image: require('@/assets/exercises/cable-biceps-curl.png'),
    videoUrl: 'https://wger.de/media/exercise-video/95/ab770931-47d3-44fd-aef0-ac7a64c3b794.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/95/view/',
  },
  'triceps-pushdown-cable': {
    image: require('@/assets/exercises/triceps-pushdown-cable.jpg'),
    videoUrl: 'https://wger.de/media/exercise-video/659/1f2eb3b6-3185-429f-8330-26dc88f39aff.MOV',
    author: 'Franpol',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/659/view/',
  },
  'overhead-triceps-extension-dumbbell': {
    image: require('@/assets/exercises/overhead-triceps-extension-dumbbell.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1336/view/',
  },
  'skull-crusher': {
    image: require('@/assets/exercises/skull-crusher.png'),
    videoUrl: 'https://wger.de/media/exercise-video/246/75eb8c88-922e-45c5-8be3-ac073f62b63f.MP4',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/246/view/',
  },
  'lateral-raise-dumbbell': {
    image: require('@/assets/exercises/lateral-raise-dumbbell.png'),
    videoUrl: 'https://wger.de/media/exercise-video/348/de69928a-8a35-4096-821c-1f46de5e0e03.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/348/view/',
  },
  'rear-delt-fly-dumbbell': {
    image: require('@/assets/exercises/rear-delt-fly-dumbbell.png'),
    author: 'cshep442',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/487/view/',
  },
  'dumbbell-chest-fly': {
    image: require('@/assets/exercises/dumbbell-chest-fly.png'),
    author: 'cshep442',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/238/view/',
  },
  'cable-chest-fly': {
    image: require('@/assets/exercises/cable-chest-fly.png'),
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/323/view/',
  },
  'leg-extension-machine': {
    image: require('@/assets/exercises/leg-extension-machine.jpg'),
    author: 'Franpol',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/369/view/',
  },
  'leg-curl-machine': {
    image: require('@/assets/exercises/leg-curl-machine.png'),
    videoUrl: 'https://wger.de/media/exercise-video/365/becaf013-5044-40d0-bae9-7ed60c973737.MOV',
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/365/view/',
  },
  'standing-calf-raise': {
    image: require('@/assets/exercises/standing-calf-raise.png'),
    author: 'erikocobra',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1243/view/',
  },
  'calf-raise-machine': {
    image: require('@/assets/exercises/calf-raise-machine.jpg'),
    videoUrl: 'https://wger.de/media/exercise-video/622/35b7b625-77fd-4c09-8c57-3ad0f2f23175.MOV',
    author: 'clafal',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/622/view/',
  },
  'dumbbell-shrug': {
    image: require('@/assets/exercises/dumbbell-shrug.png'),
    author: 'Everkinetic',
    license: 'CC-BY-SA-3.0',
    sourceUrl: 'https://wger.de/en/exercise/572/view/',
  },
  'wrist-curl-dumbbell': {
    image: require('@/assets/exercises/wrist-curl-dumbbell.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1333/view/',
  },
  'glute-kickback-band': {
    image: require('@/assets/exercises/glute-kickback-band.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1613/view/',
  },
  'stationary-bike-steady': {
    image: require('@/assets/exercises/stationary-bike-steady.png'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/1618/view/',
  },
  'jumping-jacks': {
    image: require('@/assets/exercises/jumping-jacks.png'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/320/view/',
  },
  'high-knees': {
    image: require('@/assets/exercises/high-knees.jpg'),
    author: 'wger.de',
    license: 'CC-BY-SA-4.0',
    sourceUrl: 'https://wger.de/en/exercise/983/view/',
  },
  'arnold-press': {
    image: require('@/assets/exercises/arnold-press.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'backpack-carry': {
    image: require('@/assets/exercises/backpack-carry.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-assisted-pull-up': {
    image: require('@/assets/exercises/band-assisted-pull-up.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-biceps-curl': {
    image: require('@/assets/exercises/band-biceps-curl.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-chest-press': {
    image: require('@/assets/exercises/band-chest-press.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-good-morning': {
    image: require('@/assets/exercises/band-good-morning.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-lat-pulldown': {
    image: require('@/assets/exercises/band-lat-pulldown.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-lateral-raise': {
    image: require('@/assets/exercises/band-lateral-raise.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-overhead-press': {
    image: require('@/assets/exercises/band-overhead-press.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-seated-row': {
    image: require('@/assets/exercises/band-seated-row.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-squat': {
    image: require('@/assets/exercises/band-squat.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'band-triceps-pushdown': {
    image: require('@/assets/exercises/band-triceps-pushdown.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'bodyweight-squat': {
    image: require('@/assets/exercises/bodyweight-squat.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'brisk-walk': {
    image: require('@/assets/exercises/brisk-walk.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'burpee': {
    image: require('@/assets/exercises/burpee.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'cable-chest-press': {
    image: require('@/assets/exercises/cable-chest-press.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'cable-crunch': {
    image: require('@/assets/exercises/cable-crunch.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'cable-pull-through': {
    image: require('@/assets/exercises/cable-pull-through.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'chair-squat': {
    image: require('@/assets/exercises/chair-squat.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'copenhagen-plank': {
    image: require('@/assets/exercises/copenhagen-plank.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'curtsy-lunge': {
    image: require('@/assets/exercises/curtsy-lunge.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'dead-bug': {
    image: require('@/assets/exercises/dead-bug.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'dumbbell-calf-raise': {
    image: require('@/assets/exercises/dumbbell-calf-raise.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'dumbbell-shoulder-press': {
    image: require('@/assets/exercises/dumbbell-shoulder-press.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'dumbbell-squat': {
    image: require('@/assets/exercises/dumbbell-squat.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'dumbbell-step-up': {
    image: require('@/assets/exercises/dumbbell-step-up.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'farmers-carry-dumbbells': {
    image: require('@/assets/exercises/farmers-carry-dumbbells.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'front-rack-carry-kettlebell': {
    image: require('@/assets/exercises/front-rack-carry-kettlebell.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'good-morning': {
    image: require('@/assets/exercises/good-morning.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'hip-abduction-band': {
    image: require('@/assets/exercises/hip-abduction-band.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'incline-push-up': {
    image: require('@/assets/exercises/incline-push-up.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'jump-rope': {
    image: require('@/assets/exercises/jump-rope.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'jump-squat': {
    image: require('@/assets/exercises/jump-squat.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'kettlebell-farmers-carry': {
    image: require('@/assets/exercises/kettlebell-farmers-carry.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'kettlebell-front-squat': {
    image: require('@/assets/exercises/kettlebell-front-squat.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'kettlebell-overhead-press': {
    image: require('@/assets/exercises/kettlebell-overhead-press.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'kettlebell-row': {
    image: require('@/assets/exercises/kettlebell-row.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'knee-push-up': {
    image: require('@/assets/exercises/knee-push-up.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'landmine-press': {
    image: require('@/assets/exercises/landmine-press.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'lat-pulldown-cable': {
    image: require('@/assets/exercises/lat-pulldown-cable.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'lat-pulldown-machine': {
    image: require('@/assets/exercises/lat-pulldown-machine.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'lateral-lunge': {
    image: require('@/assets/exercises/lateral-lunge.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'machine-ab-crunch': {
    image: require('@/assets/exercises/machine-ab-crunch.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'mountain-climber': {
    image: require('@/assets/exercises/mountain-climber.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'negative-pull-up': {
    image: require('@/assets/exercises/negative-pull-up.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'neutral-grip-pull-up': {
    image: require('@/assets/exercises/neutral-grip-pull-up.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'nordic-hamstring-curl': {
    image: require('@/assets/exercises/nordic-hamstring-curl.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'overhead-carry-dumbbell': {
    image: require('@/assets/exercises/overhead-carry-dumbbell.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'pallof-press-band': {
    image: require('@/assets/exercises/pallof-press-band.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'pendlay-row': {
    image: require('@/assets/exercises/pendlay-row.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'plank-to-push-up': {
    image: require('@/assets/exercises/plank-to-push-up.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'plate-carry': {
    image: require('@/assets/exercises/plate-carry.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'prone-y-t-raise': {
    image: require('@/assets/exercises/prone-y-t-raise.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'push-press': {
    image: require('@/assets/exercises/push-press.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'reverse-crunch': {
    image: require('@/assets/exercises/reverse-crunch.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'rowing-machine-intervals': {
    image: require('@/assets/exercises/rowing-machine-intervals.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'rowing-machine-steady': {
    image: require('@/assets/exercises/rowing-machine-steady.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'side-plank': {
    image: require('@/assets/exercises/side-plank.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'single-leg-glute-bridge': {
    image: require('@/assets/exercises/single-leg-glute-bridge.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'single-leg-rdl': {
    image: require('@/assets/exercises/single-leg-rdl.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'split-squat': {
    image: require('@/assets/exercises/split-squat.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'stair-climb': {
    image: require('@/assets/exercises/stair-climb.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'stationary-bike-intervals': {
    image: require('@/assets/exercises/stationary-bike-intervals.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'suitcase-carry': {
    image: require('@/assets/exercises/suitcase-carry.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'trap-bar-deadlift': {
    image: require('@/assets/exercises/trap-bar-deadlift.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'treadmill-run-intervals': {
    image: require('@/assets/exercises/treadmill-run-intervals.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'treadmill-walk-incline': {
    image: require('@/assets/exercises/treadmill-walk-incline.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'walking-lunge': {
    image: require('@/assets/exercises/walking-lunge.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
  'wall-sit': {
    image: require('@/assets/exercises/wall-sit.jpg'),
    author: 'YL Nutrición',
    license: 'own',
    sourceUrl: 'generated:muapi/seedream-5.0-pro',
  },
};

export function mediaFor(slug: string): ExerciseMedia | undefined {
  return EXERCISE_MEDIA[slug];
}

/** Texto de atribución listo para pintar bajo una imagen. */
export function attributionFor(media: ExerciseMedia): string {
  // Las ilustraciones propias no llevan licencia de terceros ni origen externo.
  if (media.license === 'own') return `© ${media.author || 'YL Nutrición'}`;
  const author = media.author ? `${media.author} · ` : '';
  return `${author}${media.license} · wger.de`;
}
