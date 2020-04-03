import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import at from "v-at";
import useTheme from "../constants/theme";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Svg, { Polygon, Defs, LinearGradient, Stop } from "react-native-svg";
import Card from "../components/cards/Card";
import { ContainedButton } from "../components/button/Button";
import { executeData, clearData } from "../store/actions/ExecuteData";
import { useLanguage } from "../constants/language/LanguageHook";
import { DrawerActions } from "react-navigation-drawer";
import i18n from "i18n-js";

const RiskScreen = ({ props, navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [language, setNewLanguage] = useLanguage();
  const [asyncState, setAsyncState] = useState({});
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [activeQuestionCount, setActiveQuestionCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState(null);
  let saveAsync = useSelector(state => {
    return state.AsyncStorageReducer;
  });
  let executeDataResponse = useSelector(state => {
    return state.ExecuteData;
  });
  Promise.resolve(saveAsync).then(value => {
    setAsyncState(value);
  });

  useEffect(() => {
    if (language) {
      if (!at(executeDataResponse, "FETCH_QUESTIONS.isInitiated"))
        dispatch(
          executeData({
            method: "GET",
            type: "FETCH_QUESTIONS",
            req: {
              language: language
            }
          })
        );
    }
  });

  useEffect(() => {
    if (questions.length === 0) {
      if (at(executeDataResponse, "FETCH_QUESTIONS.isDone")) {
        setQuestions(at(executeDataResponse, "FETCH_QUESTIONS.data"));
        setActiveQuestion(at(executeDataResponse, "FETCH_QUESTIONS.data.0"));
        setUser(at(asyncState, "metaData.activeUser"));
      }
    }
  });

  useEffect(() => {
    if(questions.length > 0 ){
      if (user !== at(asyncState, "metaData.activeUser")) {
        setUser(asyncState, "metaData.activeUser");
        dispatch(
          clearData({
            type: "FETCH_QUESTIONS"
          })
        );
        setQuestions([]);
        setActiveQuestionCount(0);
        setAnswers({});
        setTotal(0);
      }
    }
   
  });

  

  let width = Math.round(Dimensions.get("window").width);
  let height = Math.round(Dimensions.get("window").height);
  const styles = StyleSheet.create({
    root: {
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: theme.background,
      flex: 1,
      width: width,
      height: height
    },
    header: {
      position: "relative",
      zIndex: 3,
      width: width * 0.8,
      marginTop: 60,
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between"
    },
    headerText: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.white
    },
    gradient: {
      position: "absolute",
      top: 0,
      left: 0,
      height: height,
      width: width,
      zIndex: 1
    },
    card: {
      marginTop: height * 0.08,
      position: "relative",
      zIndex: 2
    },
    cardContainer: {
      alignItems: "center",
      width: width * 0.8,
      justifyContent: "flex-start",
      display: "flex",
      flexDirection: "column",
      flex: 1
    },
    index: {
      backgroundColor: theme.shadow,
      width: 60,
      height: 18,
      borderRadius: 10,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center"
    },
    questionContainer: {
      alignItems: "center",
      width: width * 0.6,
      justifyContent: "center",
      display: "flex",
      flexDirection: "column",
      marginTop: 150
    },
    textIndex: {
      fontSize: 10,
      color: theme.paragraph,
      fontWeight: "800"
    },
    buttonContainer: {
      alignItems: "center",
      width: width * 0.8,
      justifyContent: "space-evenly",
      display: "flex",
      flex: 1,
      zIndex: 10
    },
    question: {
      zIndex: 10,
      height: height * 0.8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-evenly"
    },
    questionText: {
      textAlign: "center",
      fontSize: 18,
      fontWeight: "800",
      color: theme.text
    }
  });

  const handleAnswerChoose = id => {
    let answer = answers;
    let totalValue = total;
    let allAnswers = JSON.parse(activeQuestion.answers);
    totalValue = totalValue + at(allAnswers, `${id}.weight`);
    answer[activeQuestion.questionId] = at(allAnswers, `${id}.weight`);
    setAnswers(answer);
    setTotal(totalValue);
    console.log(activeQuestionCount + 1 < questions.length+ 1, activeQuestionCount, questions.length )
    if (activeQuestionCount + 1 < questions.length) {
      setActiveQuestion(questions[activeQuestionCount + 1]);
      setActiveQuestionCount(activeQuestionCount + 1);
    } else {
      dispatch(
        executeData({
          type: "SEND_ANSWERS",
          token: asyncState.token,
          method: "POST",
          req: JSON.stringify({
            answers: answers,
            score: totalValue === total ? total : totalValue,
            name: at(asyncState, "metaData.fullname")
          })
        })
      );
    }
  };
  console.log((activeQuestionCount + 1 === questions.length))

  useEffect(() => {
    if((activeQuestionCount + 1 === questions.length)) {
      if(at(executeDataResponse, 'SEND_ANSWERS.isDone')) {
        let dataResponse = at(executeDataResponse, 'SEND_ANSWERS.data');
        console.log(dataResponse)
        navigation.navigate('result', {data: dataResponse});
        setActiveQuestionCount(0);
        setAnswers({});
        setTotal(0);
        dispatch(clearData({
          type: 'SEND_ANSWERS'
        }))
      }
    }
  })

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{i18n.t("title")}</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.dispatch(DrawerActions.openDrawer());
          }}
        >
          <AntDesign name="menu-unfold" size={22} color={theme.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.gradient}>
        <Svg height="50%" width="100%">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.active} stopOpacity="1" />
              <Stop offset="1" stopColor={theme.button} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Polygon
            points={`0 0, 0 ${height * 0.5}, ${width * 0.5}  ${height *
              0.35},${width}  ${height * 0.5}, ${width}  0`}
            fill="url(#grad)"
          />
        </Svg>
      </View>
      {activeQuestion ? (
        <View style={styles.question}>
          <View style={styles.card}>
            <Card
              shadow={true}
              content={
                <View style={styles.cardContainer}>
                  <View style={styles.index}>
                    <AntDesign
                      style={{ marginRight: 5 }}
                      name="questioncircle"
                      size={10}
                      color={theme.success}
                    />
                    <Text style={styles.textIndex}>
                      {activeQuestionCount + 1} / {questions.length}
                    </Text>
                  </View>
                  <View>
                    <View style={styles.questionContainer}>
                      <Text style={styles.questionText}>
                        {activeQuestion.question}
                      </Text>
                    </View>
                  </View>
                </View>
              }
            />
          </View>
          {activeQuestion.type === "button" ? (
            <View
              style={{
                ...styles.buttonContainer,
                ...{
                  flexDirection: JSON.parse(activeQuestion.answers).option3
                    ? "row"
                    : "row"
                }
              }}
            >
              <ContainedButton
                mLeft={2}
                mRight={2}
                width={width * 0.25}
                onPress={() => {
                  handleAnswerChoose("option1");
                }}
                fontSize={12}
                color={theme.success}
                text={JSON.parse(activeQuestion.answers).option1.text}
                textColor={theme.white}
              />
              <ContainedButton
                onPress={() => {
                  handleAnswerChoose("option2");
                }}
                mLeft={2}
                fontSize={12}
                mRight={2}
                width={width * 0.25}
                text={JSON.parse(activeQuestion.answers).option2.text}
                color={theme.button}
                textColor={theme.white}
              />
              {JSON.parse(activeQuestion.answers).option3 ? (
                <ContainedButton
                  onPress={() => {
                    handleAnswerChoose("option3");
                  }}
                  mLeft={2}
                  fontSize={12}
                  width={width * 0.25}
                  mRight={2}
                  text={JSON.parse(activeQuestion.answers).option3.text}
                  color={theme.error}
                  textColor={theme.white}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

// RiskScreen.navigationOptions = {
//   title: 'Risk'
// }

export default RiskScreen;