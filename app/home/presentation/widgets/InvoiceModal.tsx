import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StyleSheet,
    Alert,
    Dimensions,
    SafeAreaView,
    Keyboard,
    Platform,
    ActivityIndicator,
    Animated,
    PanGestureHandler,
    State
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

const CompleteInvoiceModal = ({ 
    visible, 
    onClose, 
    customers = [], 
    products = [], 
    onCreateInvoice 
}) => {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    // États pour les dropdowns
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [currentItemIndex, setCurrentItemIndex] = useState(-1);

    // Animations
    const slideAnim = useRef(new Animated.Value(height)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const headerScale = useRef(new Animated.Value(0.9)).current;
    const fadeAnims = useRef([]).current;
    const scaleAnims = useRef([]).current;

    const paymentStatuses = [
        { value: 'PENDING', label: 'En attente', icon: 'time-outline', color: '#f59e0b', bgColor: '#fef3c7' },
        { value: 'PAID', label: 'Payée', icon: 'checkmark-circle-outline', color: '#10b981', bgColor: '#d1fae5' },
        { value: 'OVERDUE', label: 'En retard', icon: 'alert-circle-outline', color: '#ef4444', bgColor: '#fee2e2' },
        { value: 'CANCELLED', label: 'Annulée', icon: 'close-circle-outline', color: '#6b7280', bgColor: '#f3f4f6' }
    ];

    const paymentMethods = [
        { value: 'CASH', label: 'Espèces', icon: 'cash-outline', color: '#10b981' },
        { value: 'BANK_TRANSFER', label: 'Virement', icon: 'card-outline', color: '#3b82f6' },
        { value: 'CARD', label: 'Carte', icon: 'card-outline', color: '#8b5cf6' },
        { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline', color: '#f59e0b' }
    ];

    // Animation d'entrée
    useEffect(() => {
        if (visible) {
            resetForm();
            
            // Animation d'entrée séquentielle
            Animated.parallel([
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Animation du header
                Animated.spring(headerScale, {
                    toValue: 1,
                    tension: 120,
                    friction: 7,
                    useNativeDriver: true,
                }).start();

                // Animation du contenu
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 400,
                    delay: 100,
                    useNativeDriver: true,
                }).start();
            });
        } else {
            // Animation de sortie
            Animated.parallel([
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const resetForm = () => {
        setSelectedCustomer(null);
        setInvoiceItems([]);
        setPaymentStatus('PENDING');
        setPaymentMethod('CASH');
        setDueDate('');
        setNotes('');
        setShowCustomerDropdown(false);
        setShowProductDropdown(false);
        setCurrentItemIndex(-1);
        setShowDatePicker(false);
        
        // Reset animations
        slideAnim.setValue(height);
        backdropAnim.setValue(0);
        contentOpacity.setValue(0);
        headerScale.setValue(0.9);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setTempDate(selectedDate);
            setDueDate(formatDate(selectedDate));
        }
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
        Keyboard.dismiss();
    };

    const addInvoiceItem = () => {
        const newItem = {
            id: Date.now(),
            product_id: null,
            product: null,
            quantity: 1,
            unit_price: 0,
            total: 0
        };
        
        // Animation d'ajout d'item
        const newItemAnim = new Animated.Value(0);
        fadeAnims.push(newItemAnim);
        
        setInvoiceItems([...invoiceItems, newItem]);
        
        // Animate l'apparition du nouvel item
        Animated.spring(newItemAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const updateInvoiceItem = (index, field, value) => {
        const updatedItems = [...invoiceItems];
        const item = updatedItems[index];

        if (field === 'product') {
            item.product = value;
            item.product_id = value?.product_id || null;
            item.unit_price = value?.product_amount || 0;
        } else if (field === 'quantity') {
            const quantity = Math.max(0, parseInt(value) || 0);
            item.quantity = quantity;
        } else if (field === 'unit_price') {
            const price = Math.max(0, parseFloat(value) || 0);
            item.unit_price = price;
        }

        item.total = (item.quantity || 0) * (item.unit_price || 0);
        setInvoiceItems(updatedItems);
    };

    const removeInvoiceItem = (index) => {
        // Animation de suppression
        const itemAnim = fadeAnims[index];
        if (itemAnim) {
            Animated.timing(itemAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                const updatedItems = invoiceItems.filter((_, i) => i !== index);
                setInvoiceItems(updatedItems);
                fadeAnims.splice(index, 1);
            });
        } else {
            const updatedItems = invoiceItems.filter((_, i) => i !== index);
            setInvoiceItems(updatedItems);
        }
    };

    const calculateTotalAmount = () => {
        return invoiceItems.reduce((total, item) => {
            return total + ((item.quantity || 0) * (item.unit_price || 0));
        }, 0);
    };

    const validateForm = () => {
        if (!selectedCustomer) {
            Alert.alert('Erreur', 'Veuillez sélectionner un client');
            return false;
        }

        if (invoiceItems.length === 0) {
            Alert.alert('Erreur', 'Veuillez ajouter au moins un produit');
            return false;
        }

        for (let i = 0; i < invoiceItems.length; i++) {
            const item = invoiceItems[i];
            if (!item.product || !item.product_id) {
                Alert.alert('Erreur', `Veuillez sélectionner un produit pour la ligne ${i + 1}`);
                return false;
            }
            if (!item.quantity || item.quantity <= 0) {
                Alert.alert('Erreur', `Veuillez saisir une quantité valide pour la ligne ${i + 1}`);
                return false;
            }
        }

        if (!dueDate) {
            Alert.alert('Erreur', 'Veuillez sélectionner une date d\'échéance');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const totalAmount = calculateTotalAmount();
            const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

            const invoiceData = {
                customer_id: selectedCustomer.id,
                invoice_number: invoiceNumber,
                status: paymentStatus,
                total_amount: totalAmount,
                currency: 'XOF',
                issued_at: new Date().toISOString().split('T')[0],
                due_date: dueDate,
                notes: notes || '',
                items: invoiceItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                })),
                payment: paymentStatus === 'PAID' ? {
                    amount: totalAmount,
                    payment_method: paymentMethod,
                    paid_at: new Date().toISOString().split('T')[0]
                } : null
            };

            await onCreateInvoice(invoiceData);
            Alert.alert('Succès', 'Facture créée avec succès');
            onClose();
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la facture');
        } finally {
            setIsSubmitting(false);
        }
    };

    const ProductSelector = ({ item, index }) => {
        const itemOpacity = fadeAnims[index] || new Animated.Value(1);
        
        return (
            <Animated.View 
                style={[
                    styles.productSelector,
                    { 
                        opacity: itemOpacity,
                        transform: [{ scale: itemOpacity }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.productButton,
                        item.product && styles.productButtonSelected
                    ]}
                    onPress={() => {
                        setCurrentItemIndex(index);
                        setShowProductDropdown(true);
                        setShowCustomerDropdown(false);
                        Keyboard.dismiss();
                    }}
                    activeOpacity={0.7}
                >
                    <View style={styles.productButtonIcon}>
                        <Ionicons 
                            name="cube-outline" 
                            size={18} 
                            color={item.product ? "#8b5cf6" : "#9ca3af"} 
                        />
                    </View>
                    <Text style={[
                        styles.productButtonText,
                        item.product && styles.productButtonTextSelected
                    ]} numberOfLines={1}>
                        {item.product?.product_name || 'Sélectionner un produit'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#9ca3af" />
                </TouchableOpacity>

                {showProductDropdown && currentItemIndex === index && (
                    <Animated.View 
                        style={[
                            styles.dropdown,
                            styles.dropdownAnimated
                        ]}
                        entering="fadeInDown"
                        exiting="fadeOutUp"
                    >
                        <ScrollView 
                            style={styles.dropdownScroll} 
                            nestedScrollEnabled
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {products && products.length > 0 ? products.map((product, productIndex) => (
                                <TouchableOpacity
                                    key={product.product_id}
                                    style={[
                                        styles.dropdownItem,
                                        productIndex === products.length - 1 && styles.dropdownItemLast
                                    ]}
                                    onPress={() => {
                                        updateInvoiceItem(index, 'product', product);
                                        setShowProductDropdown(false);
                                        setCurrentItemIndex(-1);
                                    }}
                                    activeOpacity={0.6}
                                >
                                    <View style={styles.dropdownItemContent}>
                                        <Text style={styles.dropdownItemText} numberOfLines={1}>
                                            {product.product_name}
                                        </Text>
                                        <View style={styles.dropdownItemPriceContainer}>
                                            <Text style={styles.dropdownItemPrice}>
                                                {product.product_amount?.toLocaleString() || 0} XOF
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )) : (
                                <View style={styles.emptyDropdown}>
                                    <Ionicons name="cube-outline" size={24} color="#d1d5db" />
                                    <Text style={styles.emptyText}>Aucun produit disponible</Text>
                                </View>
                            )}
                        </ScrollView>
                    </Animated.View>
                )}
            </Animated.View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="none"
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
            transparent={true}
        >
            <View style={styles.modalContainer}>
                {/* Backdrop animé */}
                <Animated.View 
                    style={[
                        styles.backdrop,
                        { opacity: backdropAnim }
                    ]} 
                />
                
                {/* Contenu principal */}
                <Animated.View 
                    style={[
                        styles.modalContent,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <SafeAreaView style={styles.container}>
                        {/* Header animé */}
                        <Animated.View 
                            style={[
                                styles.header,
                                { 
                                    transform: [{ scale: headerScale }],
                                    opacity: contentOpacity
                                }
                            ]}
                        >
                            <View style={styles.headerContent}>
                                <View style={styles.headerLeft}>
                                    <View style={styles.headerIconContainer}>
                                        <Ionicons name="receipt-outline" size={24} color="#8b5cf6" />
                                    </View>
                                    <View>
                                        <Text style={styles.headerTitle}>Nouvelle Facture</Text>
                                        <Text style={styles.headerSubtitle}>Créer une nouvelle facture</Text>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    onPress={onClose} 
                                    style={styles.closeButton}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="close" size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        <Animated.View style={[styles.contentContainer, { opacity: contentOpacity }]}>
                            <ScrollView 
                                style={styles.content} 
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{ paddingBottom: keyboardVisible ? 300 : 100 }}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Sélection du client */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <View style={styles.sectionIconContainer}>
                                            <Ionicons name="person-outline" size={20} color="#8b5cf6" />
                                        </View>
                                        <Text style={styles.sectionTitle}>Client</Text>
                                    </View>
                                    
                                    <TouchableOpacity
                                        style={[
                                            styles.customerButton,
                                            selectedCustomer && styles.customerButtonSelected
                                        ]}
                                        onPress={() => {
                                            setShowCustomerDropdown(!showCustomerDropdown);
                                            setShowProductDropdown(false);
                                            Keyboard.dismiss();
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.customerButtonIcon}>
                                            <Ionicons 
                                                name="person-circle-outline" 
                                                size={24} 
                                                color={selectedCustomer ? "#8b5cf6" : "#9ca3af"} 
                                            />
                                        </View>
                                        <Text style={[
                                            styles.customerButtonText,
                                            selectedCustomer && styles.customerButtonTextSelected
                                        ]} numberOfLines={1}>
                                            {selectedCustomer 
                                                ? `${selectedCustomer.firstname || ''} ${selectedCustomer.name || ''}`
                                                : 'Sélectionner un client'
                                            }
                                        </Text>
                                        <Ionicons 
                                            name={showCustomerDropdown ? "chevron-up" : "chevron-down"} 
                                            size={16} 
                                            color="#9ca3af" 
                                        />
                                    </TouchableOpacity>

                                    {showCustomerDropdown && (
                                        <Animated.View style={[styles.dropdown, styles.dropdownAnimated]}>
                                            <ScrollView 
                                                style={styles.dropdownScroll} 
                                                nestedScrollEnabled
                                                keyboardShouldPersistTaps="handled"
                                                showsVerticalScrollIndicator={false}
                                            >
                                                {customers && customers.length > 0 ? customers.map((customer, customerIndex) => (
                                                    <TouchableOpacity
                                                        key={customer.id}
                                                        style={[
                                                            styles.dropdownItem,
                                                            customerIndex === customers.length - 1 && styles.dropdownItemLast
                                                        ]}
                                                        onPress={() => {
                                                            setSelectedCustomer(customer);
                                                            setShowCustomerDropdown(false);
                                                        }}
                                                        activeOpacity={0.6}
                                                    >
                                                        <View style={styles.dropdownItemContent}>
                                                            <Text style={styles.dropdownItemText} numberOfLines={1}>
                                                                {`${customer.firstname || ''} ${customer.name || ''}`}
                                                            </Text>
                                                            <Text style={styles.dropdownItemSubtext} numberOfLines={1}>
                                                                {customer.email || ''}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )) : (
                                                    <View style={styles.emptyDropdown}>
                                                        <Ionicons name="people-outline" size={32} color="#d1d5db" />
                                                        <Text style={styles.emptyText}>Aucun client disponible</Text>
                                                    </View>
                                                )}
                                            </ScrollView>
                                        </Animated.View>
                                    )}
                                </View>

                                {/* Produits */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <View style={styles.sectionIconContainer}>
                                            <Ionicons name="cube-outline" size={20} color="#8b5cf6" />
                                        </View>
                                        <Text style={styles.sectionTitle}>Produits</Text>
                                        <TouchableOpacity 
                                            onPress={addInvoiceItem} 
                                            style={styles.addButton}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="add" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    {invoiceItems.map((item, index) => (
                                        <View key={item.id} style={styles.invoiceItem}>
                                            <ProductSelector item={item} index={index} />

                                            <View style={styles.itemInputs}>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Quantité</Text>
                                                    <View style={styles.inputContainer}>
                                                        <View style={styles.inputIconContainer}>
                                                            <Ionicons name="list-outline" size={16} color="#8b5cf6" />
                                                        </View>
                                                        <TextInput
                                                            style={styles.input}
                                                            value={item.quantity?.toString() || '1'}
                                                            onChangeText={(value) => updateInvoiceItem(index, 'quantity', value)}
                                                            keyboardType="numeric"
                                                            placeholder="1"
                                                            returnKeyType="done"
                                                            placeholderTextColor="#9ca3af"
                                                        />
                                                    </View>
                                                </View>

                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Prix unitaire</Text>
                                                    <View style={styles.inputContainer}>
                                                        <View style={styles.inputIconContainer}>
                                                            <Ionicons name="pricetag-outline" size={16} color="#8b5cf6" />
                                                        </View>
                                                        <TextInput
                                                            style={styles.input}
                                                            value={item.unit_price?.toString() || '0'}
                                                            onChangeText={(value) => updateInvoiceItem(index, 'unit_price', value)}
                                                            keyboardType="numeric"
                                                            placeholder="0"
                                                            returnKeyType="done"
                                                            placeholderTextColor="#9ca3af"
                                                        />
                                                    </View>
                                                </View>

                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Total</Text>
                                                    <View style={styles.totalContainer}>
                                                        <Text style={styles.totalText}>
                                                            {item.total.toLocaleString()} XOF
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => removeInvoiceItem(index)}
                                                style={styles.removeButton}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    {invoiceItems.length === 0 && (
                                        <View style={styles.emptyContainer}>
                                            <View style={styles.emptyIconContainer}>
                                                <Ionicons name="cube-outline" size={48} color="#d1d5db" />
                                            </View>
                                            <Text style={styles.emptyTitle}>Aucun produit ajouté</Text>
                                            <Text style={styles.emptySubtitle}>Commencez par ajouter des produits à votre facture</Text>
                                            <TouchableOpacity 
                                                onPress={addInvoiceItem} 
                                                style={styles.addEmptyButton}
                                                activeOpacity={0.8}
                                            >
                                                <Ionicons name="add-circle-outline" size={20} color="#8b5cf6" />
                                                <Text style={styles.addEmptyButtonText}>Ajouter un produit</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                {/* Détails */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <View style={styles.sectionIconContainer}>
                                            <Ionicons name="document-text-outline" size={20} color="#8b5cf6" />
                                        </View>
                                        <Text style={styles.sectionTitle}>Détails</Text>
                                    </View>
                                    
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Date d'échéance</Text>
                                        <TouchableOpacity 
                                            style={[styles.datePickerButton, dueDate && styles.datePickerButtonSelected]} 
                                            onPress={showDatePickerModal}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.datePickerIcon}>
                                                <Ionicons 
                                                    name="calendar-outline" 
                                                    size={18} 
                                                    color={dueDate ? "#8b5cf6" : "#9ca3af"} 
                                                />
                                            </View>
                                            <Text style={[
                                                styles.dateText,
                                                dueDate && styles.dateTextSelected
                                            ]}>
                                                {dueDate || 'Sélectionner une date'}
                                            </Text>
                                            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                        
                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={tempDate}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                onChange={handleDateChange}
                                                minimumDate={new Date()}
                                                locale="fr-FR"
                                                themeVariant="light"
                                            />
                                        )}
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Statut du paiement</Text>
                                        <ScrollView 
                                            horizontal 
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.statusContainer}
                                        >
                                            {paymentStatuses.map((status) => (
                                                <TouchableOpacity
                                                    key={status.value}
                                                    style={[
                                                        styles.statusButton,
                                                        paymentStatus === status.value && [
                                                            styles.statusButtonActive,
                                                            { backgroundColor: status.color }
                                                        ]
                                                    ]}
                                                    onPress={() => setPaymentStatus(status.value)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons 
                                                        name={status.icon} 
                                                        size={16} 
                                                        color={paymentStatus === status.value ? 'white' : status.color} 
                                                    />
                                                    <Text style={[
                                                        styles.statusButtonText,
                                                        paymentStatus === status.value && styles.statusButtonTextActive
                                                    ]}>
                                                        {status.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    {paymentStatus === 'PAID' && (
                                        <Animated.View 
                                            style={styles.inputGroup}
                                            entering="fadeInDown"
                                            exiting="fadeOutUp"
                                        >
                                            <Text style={styles.inputLabel}>Méthode de paiement</Text>
                                            <ScrollView 
                                                horizontal 
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={styles.statusContainer}
                                            >
                                                {paymentMethods.map((method) => (
                                                    <TouchableOpacity
                                                        key={method.value}
                                                        style={[
                                                            styles.statusButton,
                                                            paymentMethod === method.value && [
                                                                styles.statusButtonActive,
                                                                { backgroundColor: method.color }
                                                            ]
                                                        ]}
                                                        onPress={() => setPaymentMethod(method.value)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Ionicons 
                                                            name={method.icon} 
                                                            size={16} 
                                                            color={paymentMethod === method.value ? 'white' : method.color} 
                                                        />
                                                        <Text style={[
                                                            styles.statusButtonText,
                                                            paymentMethod === method.value && styles.statusButtonTextActive
                                                        ]}>
                                                            {method.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </Animated.View>
                                    )}

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Notes (optionnel)</Text>
                                        <View style={styles.notesContainer}>
                                            <View style={styles.notesIconContainer}>
                                                <Ionicons name="document-text-outline" size={16} color="#8b5cf6" />
                                            </View>
                                            <TextInput
                                                style={[styles.input, styles.textArea]}
                                                value={notes}
                                                onChangeText={setNotes}
                                                placeholder="Ajouter des notes additionnelles..."
                                                multiline
                                                numberOfLines={3}
                                                returnKeyType="done"
                                                placeholderTextColor="#9ca3af"
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Total */}
                                <View style={styles.totalSection}>
                                    <View style={styles.totalCard}>
                                        <View style={styles.totalCardHeader}>
                                            <View style={styles.totalIconContainer}>
                                                <Ionicons name="calculator-outline" size={24} color="white" />
                                            </View>
                                            <View style={styles.totalInfo}>
                                                <Text style={styles.totalLabel}>Total à payer</Text>
                                                <Text style={styles.totalSubtitle}>
                                                    {invoiceItems.length} produit{invoiceItems.length > 1 ? 's' : ''}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.totalAmount}>
                                            {calculateTotalAmount().toLocaleString()} XOF
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </Animated.View>

                        {/* Footer */}
                        {!keyboardVisible && (
                            <Animated.View 
                                style={[styles.footer, { opacity: contentOpacity }]}
                            >
                                <TouchableOpacity 
                                    onPress={onClose} 
                                    style={[styles.cancelButton, styles.button]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="close-outline" size={18} color="#6b7280" />
                                    <Text style={styles.cancelButtonText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    style={[
                                        styles.submitButton, 
                                        isSubmitting && styles.submitButtonDisabled, 
                                        styles.button
                                    ]}
                                    disabled={isSubmitting}
                                    activeOpacity={0.8}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <ActivityIndicator size="small" color="white" />
                                            <Text style={styles.submitButtonText}>Création...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                                            <Text style={styles.submitButtonText}>Créer la facture</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
    },
    modalContent: {
        height: height * 0.95,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f3f0ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    contentContainer: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    sectionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#f3f0ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
    },
    addButton: {
        backgroundColor: '#8b5cf6',
        borderRadius: 12,
        padding: 10,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    customerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        gap: 12,
        minHeight: 56,
    },
    customerButtonSelected: {
        borderColor: '#8b5cf6',
        backgroundColor: '#f3f0ff',
    },
    customerButtonIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    customerButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    customerButtonTextSelected: {
        color: '#1e293b',
        fontWeight: '600',
    },
    productSelector: {
        position: 'relative',
        marginBottom: 16,
        zIndex: 10,
    },
    productButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        gap: 12,
        minHeight: 56,
    },
    productButtonSelected: {
        borderColor: '#8b5cf6',
        backgroundColor: '#f3f0ff',
    },
    productButtonIcon: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productButtonText: {
        flex: 1,
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
    },
    productButtonTextSelected: {
        color: '#1e293b',
        fontWeight: '600',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        maxHeight: 240,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
        marginTop: 8,
        overflow: 'hidden',
    },
    dropdownAnimated: {
        transform: [{ scale: 1 }],
    },
    dropdownScroll: {
        maxHeight: 220,
    },
    dropdownItem: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    dropdownItemLast: {
        borderBottomWidth: 0,
    },
    dropdownItemContent: {
        flex: 1,
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '600',
        marginBottom: 2,
    },
    dropdownItemSubtext: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    dropdownItemPriceContainer: {
        marginTop: 4,
    },
    dropdownItemPrice: {
        fontSize: 14,
        color: '#8b5cf6',
        fontWeight: '700',
        backgroundColor: '#f3f0ff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    emptyDropdown: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    invoiceItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        position: 'relative',
    },
    itemInputs: {
        flexDirection: 'row',
        gap: 12,
    },
    inputGroup: {
        flex: 1,
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        minHeight: 48,
    },
    inputIconContainer: {
        width: 40,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f0ff',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    totalContainer: {
        backgroundColor: '#f3f0ff',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#c4b5fd',
        justifyContent: 'center',
        paddingHorizontal: 12,
        minHeight: 48,
    },
    totalText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#8b5cf6',
        textAlign: 'center',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        padding: 12,
        minHeight: 48,
        gap: 12,
    },
    datePickerButtonSelected: {
        borderColor: '#8b5cf6',
        backgroundColor: '#f3f0ff',
    },
    datePickerIcon: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        flex: 1,
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
    },
    dateTextSelected: {
        color: '#1e293b',
        fontWeight: '600',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    notesContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    notesIconContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 14,
        backgroundColor: '#f3f0ff',
    },
    removeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 4,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        gap: 8,
        minHeight: 40,
    },
    statusButtonActive: {
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statusButtonText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    statusButtonTextActive: {
        color: 'white',
        fontWeight: '700',
    },
    totalSection: {
        marginVertical: 8,
    },
    totalCard: {
        backgroundColor: '#8b5cf6',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    totalCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    totalIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalInfo: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    totalSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    button: {
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        minHeight: 56,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    submitButton: {
        flex: 2,
        backgroundColor: '#8b5cf6',
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 15,
    },
    addEmptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#f3f0ff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#c4b5fd',
        gap: 8,
    },
    addEmptyButtonText: {
        color: '#8b5cf6',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default CompleteInvoiceModal;