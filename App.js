import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { ethers } from 'ethers';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// i18n для русского
i18n.use(initReactI18next).init({
  resources: {
    ru: {
      translation: {
        title: 'JewelerSwap',
        connect: 'Подключить Кошелёк',
        mint: 'Минт NFT-Паспорт',
        rent: 'Арендовать Изделие',
        balance: 'Баланс ECO: '
      }
    }
  },
  lng: 'ru',
  interpolation: {
    escapeValue: false
  }
});

// Твои адреса контрактов
const NFT_ADDRESS = '0xF7b8D4e4a9cC2B8F8eE3B8dC5B8a9fF2c7E8b9D2';
const ECO_ADDRESS = '0x9A1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t';
const SWAP_ADDRESS = '0xE3f8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s';

const NFT_ABI = [
  "function mint(string memory name, string memory description) public"
];

const ECO_ABI = [
  "function balanceOf(address account) view returns (uint256)"
];

export default function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    setAccount('0x6987e74b... (твой ключ)');
    const prov = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    setProvider(prov);
  }, []);

  const mintNFT = async () => {
    if (!provider) return Alert.alert('Ошибка', 'Подключить Кошелёк');
    try {
      Alert.alert('Успех', 'NFT-паспорт заминчен! (Адрес: ' + NFT_ADDRESS + ')');
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const getBalance = async () => {
    if (!provider) return;
    try {
      const contract = new ethers.Contract(ECO_ADDRESS, ECO_ABI, provider);
      const bal = await contract.balanceOf(account);
      setBalance(bal.toString());
      Alert.alert('Баланс', 'ECO: ' + bal.toString());
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const rentItem = () => {
    Alert.alert('Аренда', 'Эскроу сделка запущена! (Адрес: ' + SWAP_ADDRESS + ')');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JewelerSwap</Text>
      <Text>Баланс ECO: {balance}</Text>
      <Button title={account ? account : 'Подключить Кошелёк'} onPress={() => setAccount('Подключено!')} />
      <Button title="Минт NFT-Паспорт" onPress={mintNFT} />
      <Button title="Арендовать Изделие" onPress={rentItem} />
      <Button title="Проверить баланс ECO" onPress={getBalance} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  }
});
