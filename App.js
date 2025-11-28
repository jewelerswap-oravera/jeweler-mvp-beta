import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { ethers } from 'ethers';
import * as Haptics from 'expo-haptics';

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

const SWAP_ABI = [
  "function rentItem(uint256 itemId, uint256 duration) public"
];

export default function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [provider, setProvider] = useState(null);

  const connectWallet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccount('0x6987e74b... (твой ключ)');
    const prov = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    setProvider(prov);
    Alert.alert('Подключено', 'Кошелёк готов к минту и аренде! (Демо-режим)');
  };

  const mintNFT = async () => {
    if (!provider) return Alert.alert('Ошибка', 'Подключи кошелёк');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Demo tx (в реале signer с PRIVATE_KEY)
      Alert.alert('Успех', 'NFT-паспорт заминчен! (Адрес: ' + NFT_ADDRESS + ', Tx: demo-0x123, газ: 0.01 MATIC)');
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const getBalance = async () => {
    if (!provider) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const contract = new ethers.Contract(ECO_ADDRESS, ECO_ABI, provider);
      const bal = await contract.balanceOf(account);
      setBalance(bal.toString());
      Alert.alert('Баланс', 'ECO: ' + bal.toString());
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const rentItem = async () => {
    if (!provider) return Alert.alert('Ошибка', 'Подключи кошелёк');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      // Demo аренда (в реале signer)
      Alert.alert('Успех', 'Аренда запущена! (Адрес: ' + SWAP_ADDRESS + ', демо: 7 дней за 10 ECO, tx: demo-0x456)');
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JewelerSwap</Text>
      <Text>Баланс ECO: {balance}</Text>
      <Button title={account ? account.slice(0,6) + '...' : 'Подключить Кошелёк'} onPress={connectWallet} />
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
