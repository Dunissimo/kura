import { LoginDto } from '../../lib/types';
import { api } from '..';

export function signIn(data: LoginDto) {
    return api.post('/auth/login', JSON.stringify(data));
}
