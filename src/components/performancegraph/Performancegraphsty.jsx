import { StyleSheet } from "react-native";

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 16,
         
        },
        title: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 16,
          color:'black',
        },
        tabsContainer: {
          flexGrow: 0,
          marginBottom: 20,
        },
        tabButton: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          marginRight: 8,
        },
        activeTab: {
          backgroundColor: '#0C36FF',
        },
        inactiveTab: {
          backgroundColor: '#F0F0F0',
        },
        tabText: {
          fontSize: 14,
          fontWeight: '500',
        },
        activeTabText: {
          color: '#FFFFFF',
        },
        inactiveTabText: {
          color: '#000000',
        },
        graphContainer: {
          height: 220,
          marginBottom: 20,
        },
        barContainer: {
          width: 50,
          marginRight: 16,
          alignItems: 'center',
         
        },
       
        barWrapper: {
          height: 180,
          width: 40,
          justifyContent: 'flex-end',
          position: 'relative',
          
          
        },
        barContent: {
          width: '100%',
          flexDirection: 'column-reverse',
          
        },
       
        
        scoreLabel: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 10,
          fontWeight: 'bold',
          zIndex: 1,
          color:"black",
        },  
        dayLabel: {
          marginTop: 8,
          fontSize: 12,
          textAlign: 'center',
          color: '#000000', 
        },
        legendContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'left',
         
        },
        legendItem: {
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 16,
          marginBottom: 8,
        },
        legendColor: {
          width: 12,
          height: 12,
          marginRight: 4,
        },
        legendText: {
          color: '#000000',
          fontSize: 12,
        },
        barValueText: {
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'center',
            paddingTop: 2,
          },
          assignmentBar: {
            width: '100%',
            backgroundColor: '#0C36FF',
            justifyContent: 'center',
            alignItems: 'center',
          },
          disciplineBar: {
            width: '100%',
            backgroundColor: '#E55048',
            justifyContent: 'center',
            alignItems: 'center',
            borderTopRightRadius: 5,
          borderTopLeftRadius: 5,
          },
          emptyBarText: {
            color: '#566573',
            fontSize: 12,
            fontWeight: 'bold',
          },
          emptyBar: {
            height: '100%',
            width: '100%',
            backgroundColor: '#CED7DE',
            justifyContent: 'center',
            alignItems: 'center',
            borderTopRightRadius: 5,
            borderTopLeftRadius: 5,
          },
      });
      

export default styles;