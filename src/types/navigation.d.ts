import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CamposVisibles } from '../interfaces/camposVisibles';

type RootStackParamList = {
  HomeScreen: { camposVisibles: CamposVisibles } | undefined;
};

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'HomeScreen'>;

export interface HomeScreenProps {
  route: HomeScreenRouteProp;
  navigation: StackNavigationProp<RootStackParamList, 'HomeScreen'>;
}
