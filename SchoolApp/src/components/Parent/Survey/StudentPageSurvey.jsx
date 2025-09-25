import { apiFetch } from "../../../utils/apiClient";
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../../../utils/env.js';
import BackIcon from '../../../assets/ParentPage/basic-img/Backicon.svg';

const StudentPageSurvey = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { survey, studentId } = route.params;

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState({}); // { questionId: "answer" }
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Static options for 'Options' type questions
    const options = [
        'Needs significant improvement',
        'Somewhat effective, but lacks engagement',
        'Clear, but can be improved',
        'Effective and clear.',
        'Excellent and highly beneficial',
    ];

    const getColorStyles = (option) => {
        switch (option) {
            case 'Needs significant improvement':
                return { container: styles.selectedRed, text: styles.redText, radio: '#EB4B42' };
            case 'Somewhat effective, but lacks engagement':
                return { container: styles.selectedOrange, text: styles.orangeText, radio: '#C66034' };
            case 'Clear, but can be improved':
                return { container: styles.selectedYellow, text: styles.yellowText, radio: '#C6B00C' };
            case 'Effective and clear.':
                return { container: styles.selectedLightGreen, text: styles.lightGreenText, radio: '#67C73B' };
            case 'Excellent and highly beneficial':
                return { container: styles.selectedGreen, text: styles.greenText, radio: '#28A53B' };
            default:
                return { container: styles.unselectedOption, text: styles.defaultText, radio: '#000' };
        }
    };

    useEffect(() => {
        fetchSurveyQuestions();
    }, []);

    const fetchSurveyQuestions = () => {
        setLoading(true);
        apiFetch(`/api/student/getSurveyQuestions?surveyId=${survey.id}`)
            .then(res => res)
            .then(data => {
                if (data.success) {
                    setQuestions(data.questions);
                    const initialResponses = {};
                    data.questions.forEach(q => {
                        initialResponses[q.id] = ''; // Initialize all answers as empty strings
                    });
                    setResponses(initialResponses);
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                Alert.alert("Error", "Failed to load survey questions.");
                navigation.goBack();
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSelection = (questionId, value) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleSubmit = () => {
        // Validate all questions are answered
        for (const q of questions) {
            if (!responses[q.id] || responses[q.id].trim() === '') {
                Alert.alert("Incomplete", `Please answer question ${questions.indexOf(q) + 1}.`);
                return;
            }
        }

        const formattedResponses = Object.keys(responses).map(questionId => ({
            question_id: parseInt(questionId),
            answer: responses[questionId],
        }));
        
        setLoading(true);
        apiFetch(`/student/submitSurveyResponse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                surveyId: survey.id,
                studentId: studentId,
                responses: formattedResponses,
            }),
        })
        .then(res => res)
        .then(data => {
            if (data.success) {
                Alert.alert("Success", "Feedback submitted successfully!");
                navigation.goBack();
            } else {
                throw new Error(data.message || "Failed to submit feedback.");
            }
        })
        .catch(error => {
            Alert.alert("Error", error.message);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A54F8" />
                </View>
            </SafeAreaView>
        );
    }

    if (questions.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.noQuestionsText}>No questions found for this survey.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isAnswered = responses[currentQuestion.id] && responses[currentQuestion.id].trim() !== '';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <BackIcon width={24} height={24} />
                </TouchableOpacity>
                <Text style={styles.headerTxt}>Survey</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>
                    <Text style={styles.question}>{currentQuestion.question_text}</Text>

                    {currentQuestion.answer_type === 'Text' ? (
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type your answer here..."
                            placeholderTextColor="#999"
                            multiline
                            value={responses[currentQuestion.id]}
                            onChangeText={text => handleSelection(currentQuestion.id, text)}
                        />
                    ) : (
                        <View style={styles.optionsContainer}>
                            {options.map(optionText => {
                                const isSelected = responses[currentQuestion.id] === optionText;
                                const colorStyles = getColorStyles(optionText);
                                
                                return (
                                    <TouchableOpacity
                                        key={optionText}
                                        style={[
                                            styles.radioButtonContainer,
                                            isSelected ? colorStyles.container : styles.unselectedOption
                                        ]}
                                        onPress={() => handleSelection(currentQuestion.id, optionText)}
                                        activeOpacity={0.7}
                                    >
                                        <RadioButton.Android
                                            value={optionText}
                                            status={isSelected ? 'checked' : 'unchecked'}
                                            onPress={() => handleSelection(currentQuestion.id, optionText)}
                                            color={isSelected ? colorStyles.radio : '#D1D5DB'}
                                            uncheckedColor="#D1D5DB"
                                        />
                                        <Text style={[
                                            styles.radioText,
                                            isSelected ? colorStyles.text : styles.defaultText
                                        ]}>
                                            {optionText}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, !isAnswered && styles.disabledButton]}
                    disabled={!isAnswered}
                    onPress={isLastQuestion ? handleSubmit : handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.nextButtonText}>
                        {isLastQuestion ? 'Complete Feedback' : 'Next'}
                    </Text>
                    {!isLastQuestion && <Text style={styles.nextArrow}>›</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        // flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noQuestionsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 4,
    },
    headerTxt: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginLeft: 12,
    },
    headerSpacer: {
        flex: 1,
    },
    scrollView: {
        // flex: 2,
    },
    contentContainer: {
        padding: 20,
    },
    question: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        lineHeight: 26,
        marginBottom: 24,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 16,
        minHeight: 120,
        textAlignVertical: 'top',
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    optionsContainer: {
        gap: 12,
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    unselectedOption: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
    },
    selectedRed: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    selectedOrange: {
        backgroundColor: '#FFF7ED',
        borderColor: '#FED7AA',
    },
    selectedYellow: {
        backgroundColor: '#FEFCE8',
        borderColor: '#FEF08A',
    },
    selectedLightGreen: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
    },
    selectedGreen: {
        backgroundColor: '#F0FDF4',
        borderColor: '#86EFAC',
    },
    radioText: {
        fontSize: 16,
        marginLeft: 12,
        flex: 1,
        lineHeight: 22,
    },
    defaultText: {
        color: '#374151',
    },
    redText: {
        color: '#DC2626',
        fontWeight: '500',
    },
    orangeText: {
        color: '#EA580C',
        fontWeight: '500',
    },
    yellowText: {
        color: '#CA8A04',
        fontWeight: '500',
    },
    lightGreenText: {
        color: '#16A34A',
        fontWeight: '500',
    },
    greenText: {
        color: '#15803D',
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    nextButton: {
        backgroundColor: '#6366F1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledButton: {
        backgroundColor: '#D1D5DB',
        shadowOpacity: 0,
        elevation: 0,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    nextArrow: {
        color: '#FFFFFF',
        fontSize: 20,
        marginLeft: 8,
        fontWeight: '300',
    },
});

export default StudentPageSurvey;