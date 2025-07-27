import React, { useState, useEffect } from 'react';
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
    ActivityIndicator
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

    const paymentStatuses = [
        { value: 'PENDING', label: 'En attente', icon: 'time-outline' },
        { value: 'PAID', label: 'Payée', icon: 'checkmark-circle-outline' },
        { value: 'OVERDUE', label: 'En retard', icon: 'alert-circle-outline' },
        { value: 'CANCELLED', label: 'Annulée', icon: 'close-circle-outline' }
    ];

    const paymentMethods = [
        { value: 'CASH', label: 'Espèces', icon: 'cash-outline' },
        { value: 'BANK_TRANSFER', label: 'Virement', icon: 'card-outline' },
        { value: 'CARD', label: 'Carte', icon: 'card-outline' },
        { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline' }
    ];

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

    useEffect(() => {
        if (visible) {
            resetForm();
        }
    }, [visible]);

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
        setInvoiceItems([...invoiceItems, newItem]);
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
        const updatedItems = invoiceItems.filter((_, i) => i !== index);
        setInvoiceItems(updatedItems);
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

    const ProductSelector = ({ item, index }) => (
        <View style={styles.productSelector}>
            <TouchableOpacity
                style={styles.productButton}
                onPress={() => {
                    setCurrentItemIndex(index);
                    setShowProductDropdown(true);
                    setShowCustomerDropdown(false);
                    Keyboard.dismiss();
                }}
            >
                <Ionicons name="cube-outline" size={18} color="#6b7280" />
                <Text style={styles.productButtonText} numberOfLines={1}>
                    {item.product?.product_name || 'Sélectionner un produit'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>

            {showProductDropdown && currentItemIndex === index && (
                <View style={styles.dropdown}>
                    <ScrollView 
                        style={styles.dropdownScroll} 
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                    >
                        {products && products.length > 0 ? products.map((product) => (
                            <TouchableOpacity
                                key={product.product_id}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    updateInvoiceItem(index, 'product', product);
                                    setShowProductDropdown(false);
                                    setCurrentItemIndex(-1);
                                }}
                            >
                                <Text style={styles.dropdownItemText} numberOfLines={1}>
                                    {product.product_name}
                                </Text>
                                <Text style={styles.dropdownItemPrice}>
                                    {product.product_amount?.toLocaleString() || 0} XOF
                                </Text>
                            </TouchableOpacity>
                        )) : (
                            <Text style={styles.emptyText}>Aucun produit disponible</Text>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
            transparent={false}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Nouvelle Facture</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.content} 
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: keyboardVisible ? 300 : 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Sélection du client */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="person-outline" size={18} /> Client
                        </Text>
                        <TouchableOpacity
                            style={styles.customerButton}
                            onPress={() => {
                                setShowCustomerDropdown(!showCustomerDropdown);
                                setShowProductDropdown(false);
                                Keyboard.dismiss();
                            }}
                        >
                            <Ionicons name="person-circle-outline" size={20} color="#6b7280" />
                            <Text style={styles.customerButtonText} numberOfLines={1}>
                                {selectedCustomer 
                                    ? `${selectedCustomer.firstname || ''} ${selectedCustomer.name || ''}`
                                    : 'Sélectionner un client'
                                }
                            </Text>
                            <Ionicons 
                                name={showCustomerDropdown ? "chevron-up" : "chevron-down"} 
                                size={16} 
                                color="#6b7280" 
                            />
                        </TouchableOpacity>

                        {showCustomerDropdown && (
                            <View style={styles.dropdown}>
                                <ScrollView 
                                    style={styles.dropdownScroll} 
                                    nestedScrollEnabled
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {customers && customers.length > 0 ? customers.map((customer) => (
                                        <TouchableOpacity
                                            key={customer.id}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setSelectedCustomer(customer);
                                                setShowCustomerDropdown(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText} numberOfLines={1}>
                                                {`${customer.firstname || ''} ${customer.name || ''}`}
                                            </Text>
                                            <Text style={styles.dropdownItemSubtext} numberOfLines={1}>
                                                {customer.email || ''}
                                            </Text>
                                        </TouchableOpacity>
                                    )) : (
                                        <View style={styles.emptyContainer}>
                                            <Ionicons name="people-outline" size={32} color="#d1d5db" />
                                            <Text style={styles.emptyText}>Aucun client disponible</Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* Produits */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                <Ionicons name="cube-outline" size={18} /> Produits
                            </Text>
                            <TouchableOpacity 
                                onPress={addInvoiceItem} 
                                style={styles.addButton}
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
                                            <Ionicons name="list-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                value={item.quantity?.toString() || '1'}
                                                onChangeText={(value) => updateInvoiceItem(index, 'quantity', value)}
                                                keyboardType="numeric"
                                                placeholder="1"
                                                returnKeyType="done"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Prix unitaire</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="pricetag-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                value={item.unit_price?.toString() || '0'}
                                                onChangeText={(value) => updateInvoiceItem(index, 'unit_price', value)}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                returnKeyType="done"
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
                                >
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {invoiceItems.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cube-outline" size={32} color="#d1d5db" />
                                <Text style={styles.emptyText}>Aucun produit ajouté</Text>
                                <TouchableOpacity 
                                    onPress={addInvoiceItem} 
                                    style={styles.addEmptyButton}
                                >
                                    <Text style={styles.addEmptyButtonText}>Ajouter un produit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Détails de la facture */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            <Ionicons name="document-text-outline" size={18} /> Détails
                        </Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Date d'échéance</Text>
                            <TouchableOpacity 
                                style={styles.datePickerButton} 
                                onPress={showDatePickerModal}
                            >
                                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                                <Text style={styles.dateText}>
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
                                            paymentStatus === status.value && styles.statusButtonActive
                                        ]}
                                        onPress={() => setPaymentStatus(status.value)}
                                    >
                                        <Ionicons 
                                            name={status.icon} 
                                            size={16} 
                                            color={paymentStatus === status.value ? 'white' : '#6b7280'} 
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
                            <View style={styles.inputGroup}>
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
                                                paymentMethod === method.value && styles.statusButtonActive
                                            ]}
                                            onPress={() => setPaymentMethod(method.value)}
                                        >
                                            <Ionicons 
                                                name={method.icon} 
                                                size={16} 
                                                color={paymentMethod === method.value ? 'white' : '#6b7280'} 
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
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Notes (optionnel)</Text>
                            <View style={styles.notesContainer}>
                                <Ionicons name="document-text-outline" size={18} color="#9ca3af" style={styles.notesIcon} />
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Notes additionnelles..."
                                    multiline
                                    numberOfLines={3}
                                    returnKeyType="done"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Total */}
                    <View style={styles.totalSection}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total à payer</Text>
                            <Text style={styles.totalAmount}>
                                {calculateTotalAmount().toLocaleString()} XOF
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer - Rend conditionnellement si le clavier est visible */}
                {!keyboardVisible && (
                    <View style={styles.footer}>
                        <TouchableOpacity 
                            onPress={onClose} 
                            style={[styles.cancelButton, styles.button]}
                        >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled, styles.button]}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark" size={18} color="white" />
                                    <Text style={styles.submitButtonText}>
                                        Créer la facture
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#374151',
        letterSpacing: 0.5,
    },
    closeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addButton: {
        backgroundColor: '#7e57c2',
        borderRadius: 12,
        padding: 10,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#7e57c2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    customerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 10,
    },
    customerButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    productSelector: {
        position: 'relative',
        marginBottom: 12,
        zIndex: 10,
    },
    productButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 10,
    },
    productButtonText: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        maxHeight: 200,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginTop: 6,
    },
    dropdownScroll: {
        maxHeight: 180,
    },
    dropdownItem: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f9fafb',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
        flex: 1,
    },
    dropdownItemSubtext: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 2,
    },
    dropdownItemPrice: {
        fontSize: 14,
        color: '#7e57c2',
        fontWeight: '600',
        marginLeft: 10,
    },
    invoiceItem: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingRight: 50,
        position: 'relative',
    },
    itemInputs: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    inputGroup: {
        flex: 1,
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    inputIcon: {
        padding: 12,
        backgroundColor: '#f9fafb',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#374151',
        minHeight: 46,
    },
    totalContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        paddingHorizontal: 12,
        minHeight: 46,
    },
    totalText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#7e57c2',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 12,
        minHeight: 46,
    },
    dateText: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
        marginLeft: 10,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    notesContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    notesIcon: {
        padding: 12,
        paddingTop: 14,
        backgroundColor: '#f9fafb',
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 6,
        borderRadius: 6,
        backgroundColor: '#fee2e2',
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 6,
    },
    statusButtonActive: {
        backgroundColor: '#7e57c2',
        borderColor: '#7e57c2',
    },
    statusButtonText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    statusButtonTextActive: {
        color: 'white',
    },
    totalSection: {
        backgroundColor: '#7e57c2',
        borderRadius: 14,
        padding: 24,
        marginVertical: 10,
        shadowColor: '#7e57c2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    footer: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    submitButton: {
        flex: 2,
        backgroundColor: '#7e57c2',
        shadowColor: '#7e57c2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9ca3af',
        marginTop: 10,
        fontSize: 15,
    },
    addEmptyButton: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f0f9ff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0f2fe',
    },
    addEmptyButtonText: {
        color: '#0ea5e9',
        fontWeight: '500',
    },
});

export default CompleteInvoiceModal;