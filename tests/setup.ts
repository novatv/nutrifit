// Los tests de dominio son lógica pura; esto evita ruido de la capa de animación.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
